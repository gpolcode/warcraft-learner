import { Injectable, inject } from '@angular/core';
import { median } from 'd3-array';
import { AuraWindowsService } from '../analysis/aura-windows-service';
import { SpellDataDumpService } from '../simc/spell-data-dump-service';
import type { SpellRecord } from '../simc/simc.models';
import { getOrInsert } from '../analysis/analysis-math';
import type { AbilityIndex, ParseObservation, ParseSample } from './rulebook-build.models';

/** A button pressed inside the rotation: it costs something and comes back within a few globals. */
const FILLER_MAX_COOLDOWN_S = 10;
/** Shadow Dance comes back in 20s and is the spec's core window, so the floor sits below it. */
const MAJOR_COOLDOWN_MIN_S = 20;
const APPLY_TYPES = new Set(['applybuff', 'applydebuff']);
/** Stealth and Vanish show up for a global or two; a filler choice needs a state that lasts. */
const STATE_MIN_UPTIME_SHARE = 0.05;

@Injectable({ providedIn: 'root' })
export class AbilityIndexService {
  private readonly dump = inject(SpellDataDumpService);
  private readonly auraWindows = inject(AuraWindowsService);

  build(records: SpellRecord[], samples: ParseSample[], classLabel: string, specLabel: string): AbilityIndex {
    const owned = records.filter(record => this.owned(record, classLabel, specLabel));
    const byToken = new Map<string, SpellRecord[]>();
    for (const record of owned) getOrInsert(byToken, this.dump.token(record.name), () => []).push(record);
    return { classLabel, specLabel, byToken, observation: this.observe(samples) };
  }

  /** Another spec's spells share the class dump; they are dropped so a same-named ability cannot resolve to the wrong spec's id. */
  private owned(record: SpellRecord, classLabel: string, specLabel: string): boolean {
    const className = record.className;
    return className === null || className === classLabel || className === `${specLabel} ${classLabel}`;
  }

  /** The dump names one owning spec per talent even when several take it, so this reads only as a hint for buttons the APL never presses. */
  talentOfAnotherSpec(record: SpellRecord, specLabel: string): boolean {
    const talent = record.talent;
    if (talent?.tree === 'spec') return talent.owner !== specLabel;
    return talent?.tree === 'hero' && !talent.owner.includes(specLabel);
  }

  /** The hero tree a talent token belongs to, read from the dump's talent entry; null for a class or spec talent. */
  heroTree(index: AbilityIndex, token: string): string | null {
    const talent = (index.byToken.get(token) ?? []).find(record => record.talent?.tree === 'hero')?.talent;
    return talent ? talent.owner.replace(/\s*\(.*$/, '') : null;
  }

  /** Two buttons compete for the same press when they spend the same pools: a builder never stands in for a finisher. */
  sameRole(a: SpellRecord, b: SpellRecord): boolean {
    const pools = (record: SpellRecord) => [...new Set(record.resources.map(resource => resource.powerType))].sort((x, y) => x - y).join(',');
    return pools(a) === pools(b);
  }

  /** A state worth judging a filler choice by was seen in the sampled parses for a real share of the fight; without samples every state counts. */
  stateObserved(index: AbilityIndex, auraId: number): boolean {
    if (index.observation.sampleCount === 0) return true;
    return (index.observation.uptimeShare.get(auraId) ?? 0) >= STATE_MIN_UPTIME_SHARE;
  }

  observe(samples: ParseSample[]): ParseObservation {
    const uptimes = new Map<number, number[]>();
    const observation: ParseObservation = {
      sampleCount: samples.length, castParses: new Map(), buffParses: new Map(), debuffParses: new Map(), applications: new Map(),
      uptimeShare: new Map(), firstCastS: new Map(), castCounts: [], sampleDurationsS: samples.map(sample => sample.fightDurationS),
    };
    for (const sample of samples) this.observeSample(sample, observation, uptimes);
    observation.uptimeShare = new Map([...uptimes].map(([id, shares]) => [id, median(shares) ?? 0]));
    return observation;
  }

  private bump(map: Map<number, number>, id: number): void {
    map.set(id, (map.get(id) ?? 0) + 1);
  }

  private observeSample(sample: ParseSample, observation: ParseObservation, uptimes: Map<number, number[]>): void {
    const counts = new Map<number, number>();
    const firstSeen = new Map<number, number>();
    for (const event of sample.casts) {
      if (!counts.has(event.abilityGameID)) firstSeen.set(event.abilityGameID, event.atS);
      this.bump(counts, event.abilityGameID);
    }
    observation.castCounts.push(counts);
    for (const id of counts.keys()) {
      this.bump(observation.castParses, id);
      getOrInsert(observation.firstCastS, id, () => []).push(firstSeen.get(id) ?? 0);
    }
    for (const id of new Set(sample.buffs.map(event => event.abilityGameID))) this.bump(observation.buffParses, id);
    for (const id of new Set(sample.debuffs.map(event => event.abilityGameID))) this.bump(observation.debuffParses, id);
    const auras = [...sample.buffs, ...sample.debuffs];
    for (const event of auras) if (APPLY_TYPES.has(event.type)) this.bump(observation.applications, event.abilityGameID);
    const windows = this.auraWindows.buildAuraWindows(auras);
    for (const id of windows.keys()) getOrInsert(uptimes, id, () => []).push(this.auraWindows.auraUptimePct(windows, id, sample.fightDurationS) / 100);
  }

  /** How much of a cooldown's possible uses the sampled parses took, as a median share; 1 when nothing was sampled. */
  usageShare(index: AbilityIndex, record: SpellRecord): number {
    const cooldownS = this.effectiveCooldownS(record);
    const { sampleDurationsS, castCounts } = index.observation;
    if (!sampleDurationsS.length || cooldownS === null) return 1;
    const shares = sampleDurationsS.map((durationS, position) => (castCounts[position]?.get(record.id) ?? 0) / Math.max(1, durationS / cooldownS));
    return median(shares) ?? 0;
  }

  /** A record the player can press, as opposed to the aura, the passive or the hidden twin sharing its name. */
  castable(record: SpellRecord): boolean {
    if (record.passive || record.hidden) return false;
    return record.resources.length > 0 || record.cooldownS !== null || record.rechargeS !== null || record.gcd || record.castTimeS !== null;
  }

  private auraLike(record: SpellRecord): boolean {
    return record.durationS !== null || record.effects.some(effect => effect.type === 'Apply Aura');
  }

  effectiveCooldownS(record: SpellRecord): number | null {
    const recharge = record.rechargeS;
    if (recharge !== null && (record.cooldownS === null || recharge > record.cooldownS)) return recharge;
    return record.cooldownS;
  }

  isMajorCooldown(record: SpellRecord): boolean {
    return this.castable(record) && (this.effectiveCooldownS(record) ?? 0) >= MAJOR_COOLDOWN_MIN_S;
  }

  isFiller(record: SpellRecord): boolean {
    return this.castable(record) && record.resources.length > 0 && (this.effectiveCooldownS(record) ?? 0) < FILLER_MAX_COOLDOWN_S;
  }

  /** The id the logs record for a pressed action: the observed cast wins, then the spec's own record, then the class one. */
  cast(index: AbilityIndex, token: string): SpellRecord | null {
    const candidates = (index.byToken.get(token) ?? []).filter(record => this.castable(record));
    return this.best(candidates, [
      record => index.observation.castParses.get(record.id) ?? 0,
      record => (record.className === `${index.specLabel} ${index.classLabel}` ? 1 : 0),
    ]);
  }

  /** The id the logs record for an aura: the observed one wins, then a record whose effect faces the right way. */
  aura(index: AbilityIndex, token: string, scope: 'self' | 'target'): SpellRecord | null {
    const candidates = (index.byToken.get(token) ?? index.byToken.get(token.replace(/_dot$/, '')) ?? []).filter(record => this.auraLike(record));
    const observed = scope === 'self' ? index.observation.buffParses : index.observation.debuffParses;
    const wanted = scope === 'self' ? 'self' : 'enemy';
    return this.best(candidates, [
      record => observed.get(record.id) ?? 0,
      record => (index.observation.buffParses.get(record.id) ?? 0) + (index.observation.debuffParses.get(record.id) ?? 0),
      record => (record.effects.some(effect => effect.type === 'Apply Aura' && effect.target === wanted) ? 1 : 0),
      record => (record.durationS !== null ? 1 : 0),
    ]);
  }

  private best(candidates: SpellRecord[], scores: ((record: SpellRecord) => number)[]): SpellRecord | null {
    const ranked = [...candidates].sort((a, b) => {
      for (const score of scores) {
        const gap = score(b) - score(a);
        if (gap !== 0) return gap;
      }
      return a.id - b.id;
    });
    return ranked[0] ?? null;
  }
}
