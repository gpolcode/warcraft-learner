import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { WclAuthService } from '../../core/services/wcl-auth';
import { WclApiService } from '../../core/services/wcl-api';
import { EncounterService } from '../../core/services/encounter';
import { CharacterInfo, CharacterGear, WclUserCharacter } from '../../core/models/wcl.models';
import { EncounterEntry, EncounterBench, EncounterGearStats } from '../../core/models/encounter.models';
import { Rulebook } from '../../core/models/rulebook.models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';
import { FormatDurationPipe } from '../../shared/pipes/format-duration-pipe';
import { FormatSpecPipe } from '../../shared/pipes/format-spec-pipe';


const SLOT_NAMES: Record<number, string> = {
  0:'Head', 1:'Neck', 2:'Shoulder', 3:'Back', 4:'Chest', 5:'Waist', 6:'Legs',
  7:'Feet', 8:'Wrists', 9:'Hands', 10:'Ring 1', 11:'Ring 2',
  12:'Trinket 1', 13:'Trinket 2', 14:'Back', 15:'Main Hand', 16:'Off Hand',
};

interface CdPlanItem {
  name: string;
  openLabel: string | null;
  usesLabel: string | null;
  blLabel: string | null;
  holdLabels: string[];
  rule: string | null;
}

interface DefPlanItem {
  name: string;
  usesLabel: string | null;
  firstLabel: string | null;
  windowLabels: string[];
  rule: string | null;
}

interface EnchantRow {
  slotName: string;
  status: 'ok' | 'warn' | 'info';
  note: string;
}

interface TalentBuildRow {
  pct: number;
  isPlayer: boolean;
  link: string | null;
  playerName: string;
  label: string;
}

interface GemCheck {
  count: number;
  expected: number;
  status: 'ok' | 'warn';
  note: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-pre-fight',
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatCardModule, MatIconModule,
    LoadingSpinnerComponent, FormatDurationPipe, FormatSpecPipe,
  ],
  templateUrl: './pre-fight.html',
  styleUrl: './pre-fight.scss',
})
export class PreFightComponent implements OnInit {
  private readonly auth = inject(WclAuthService);
  private readonly wclApi = inject(WclApiService);
  private readonly encounterSvc = inject(EncounterService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly linkedCharControl = new FormControl<WclUserCharacter | null>(null);
  protected readonly manualSpecControl = new FormControl('', { nonNullable: true });
  protected readonly encControl = new FormControl<number>({ value: 0, disabled: true }, { nonNullable: true });

  protected readonly linkedChars = signal<WclUserCharacter[]>([]);
  protected readonly charInfo = signal<CharacterInfo | null>(null);
  protected readonly charGear = signal<CharacterGear | null>(null);
  protected readonly encounters = signal<EncounterEntry[]>([]);
  protected readonly selectedEncId = toSignal(this.encControl.valueChanges, { initialValue: this.encControl.value });
  protected readonly bench = signal<EncounterBench | null>(null);
  protected readonly rulebook = signal<Rulebook | null>(null);
  protected readonly loading = signal(false);
  protected readonly loadingBrief = signal(false);
  protected readonly error = signal('');
  protected readonly gearStats = computed(() => this.bench()?.gear ?? null);

  // Cooldown game plan: target opener timing, expected uses, BL alignment and
  // hold targets per major cooldown, drawn from the top-parse benchmarks.
  protected readonly cdPlan = computed<CdPlanItem[]>(() => {
    const rb = this.rulebook();
    if (!rb?.major_cooldowns?.length) return [];
    const benchmarks = this.bench()?.per_cd_benchmarks ?? {};
    const cds = [...rb.major_cooldowns].sort((a, b) => {
      const pa = a.opener_priority ?? 99;
      const pb = b.opener_priority ?? 99;
      return pa !== pb ? pa - pb : a.name.localeCompare(b.name);
    });
    return cds.map(cd => {
      const b = benchmarks[cd.name];
      const openLabel = b?.avg_first_cast_s != null
        ? `First cast ~${this._fmtTime(b.avg_first_cast_s)}` : null;
      let usesLabel: string | null = null;
      if (b?.avg_uses) {
        const upm = b.uses_per_min?.avg ?? b.avg_uses_per_min ?? null;
        usesLabel = `~${Math.round(b.avg_uses)} use${b.avg_uses >= 1.5 ? 's' : ''}`
          + (upm ? ` (${upm.toFixed(1)}/min)` : '');
      }
      let blLabel: string | null = null;
      if (cd.align_with_bloodlust) {
        blLabel = b && b.bl_pct >= 40
          ? `Align with Bloodlust - ${b.bl_pct}% of top parsers do`
          : 'Align with Bloodlust';
      }
      const holdLabels: string[] = [];
      if (b?.majority_hold && b.hold_targets) {
        const entries = Object.entries(b.hold_targets).sort((a, c) => Number(a[0]) - Number(c[0]));
        for (const [idx, h] of entries) {
          holdLabels.push(`Hold cast #${Number(idx) + 1} until ~${this._fmtTime(h.target_s)}`);
        }
      }
      return { name: cd.name, openLabel, usesLabel, blLabel, holdLabels, rule: cd.usage_rule ?? null };
    });
  });

  // Defensive plan: when top parsers fire each defensive and how often.
  protected readonly defensivePlan = computed<DefPlanItem[]>(() => {
    const rb = this.rulebook();
    if (!rb?.defensives?.length) return [];
    const benchmarks = this.bench()?.per_defensive_benchmarks ?? {};
    const windows = this.bench()?.defensive_windows ?? [];
    return rb.defensives.map(def => {
      const b = benchmarks[def.name];
      const windowLabels = windows
        .filter(w => (w.defensive_name ?? w.common_defensives?.[0]) === def.name)
        .sort((a, c) => a.time_s - c.time_s)
        .map(w => this._fmtTime(w.time_s));
      const usesLabel = b?.avg_uses
        ? `~${Math.round(b.avg_uses)} use${b.avg_uses >= 1.5 ? 's' : ''}` : null;
      const firstLabel = b?.avg_first_cast_s != null
        ? `First use ~${this._fmtTime(b.avg_first_cast_s)}` : null;
      return { name: def.name, usesLabel, firstLabel, windowLabels, rule: def.usage_rule ?? null };
    }).filter(d => d.usesLabel || d.firstLabel || d.windowLabels.length || d.rule);
  });

  // Enchants: flag slots the player left un-enchanted that top parsers consider
  // mandatory, and surface where the player differs from the consensus enchant.
  protected readonly enchantRows = computed<EnchantRow[]>(() => {
    const gear = this.charGear();
    const stats = this.gearStats();
    const topEnch = stats?.enchants ?? {};
    const playerEnch = gear?.enchants ?? [];
    if (!Object.keys(topEnch).length && !playerEnch.length) return [];
    const slots = new Set<number>();
    for (const k of Object.keys(topEnch)) slots.add(Number(k));
    for (const e of playerEnch) slots.add(e.slot);

    const rows: EnchantRow[] = [];
    for (const slot of [...slots].sort((a, b) => a - b)) {
      const top = topEnch[slot]?.[0];
      const topName = top ? (top.name || `Enchant #${top.id}`) : '';
      const player = playerEnch.find(e => e.slot === slot);
      if (!player) {
        if (top && top.pct >= 70) {
          rows.push({ slotName: this.slotName(slot), status: 'warn',
            note: `Missing - ${top.pct}% of top parsers enchant this slot` });
        } else if (top && top.pct >= 40) {
          rows.push({ slotName: this.slotName(slot), status: 'info',
            note: `Optional - ${top.pct}% of top parsers enchant here` });
        }
        continue;
      }
      const playerName = player.name || `Enchant #${player.id}`;
      if (top && player.id === top.id) {
        rows.push({ slotName: this.slotName(slot), status: 'ok', note: `${playerName} - matches top (${top.pct}%)` });
      } else if (top) {
        rows.push({ slotName: this.slotName(slot), status: 'info', note: `${playerName} - top parsers use ${topName} (${top.pct}%)` });
      } else {
        rows.push({ slotName: this.slotName(slot), status: 'ok', note: playerName });
      }
    }
    return rows;
  });

  protected readonly enchantDot = computed(() =>
    this.enchantRows().some(r => r.status === 'warn') ? 'warn' : 'ok');

  // Top-parse talent builds with a link to an example parse running each one.
  protected readonly talentBuilds = computed<TalentBuildRow[]>(() => {
    const builds = this.gearStats()?.talent_builds ?? [];
    if (!builds.length) return [];
    const playerKey = this.charGear()?.talent_key ?? '';
    return builds.map((b, i) => ({
      pct: b.pct,
      isPlayer: !!playerKey && b.key === playerKey,
      link: b.report_code ? `https://www.warcraftlogs.com/reports/${b.report_code}#fight=${b.fight_id ?? 0}` : null,
      playerName: b.player_name || '',
      label: i === 0 ? 'Most common build' : `Alt build ${i}`,
    }));
  });

  // Filled-socket check: compare the player's gem count to the top-parse total.
  protected readonly gemCheck = computed<GemCheck | null>(() => {
    const gems = this.gearStats()?.gems;
    const count = this.charGear()?.gem_count;
    if (!gems || count == null) return null;
    const expected = gems.max_count;
    if (count >= expected) {
      return { count, expected, status: 'ok', note: `All ${expected} socket${expected === 1 ? '' : 's'} filled` };
    }
    const diff = expected - count;
    return { count, expected, status: 'warn',
      note: `${diff} socket${diff === 1 ? '' : 's'} may be unfilled - top parsers gem ${expected}` };
  });

  async ngOnInit(): Promise<void> {
    if (!this.auth.isLoggedIn()) return;
    await this._init();
    const autoEnc = parseInt(this.route.snapshot.queryParamMap.get('encounter') || '0', 10);
    if (autoEnc && this.charInfo()?.spec) {
      this.encControl.setValue(autoEnc);
      await this.onEncChange();
    }
  }

  private async _init(): Promise<void> {
    let chars: WclUserCharacter[] = [];
    try {
      chars = await this.wclApi.fetchUserCharacters();
    } catch (err) {
      this.error.set(`Could not load your WCL characters: ${err instanceof Error ? err.message : String(err)}`);
    }
    this.linkedChars.set(chars);
    if (chars.length) {
      this.linkedCharControl.setValue(chars[0]);
      await this._loadLinkedChar(chars[0]);
    }
  }

  protected async onLinkedCharChange(char: WclUserCharacter): Promise<void> {
    await this._loadLinkedChar(char);
  }

  private async _loadLinkedChar(char: WclUserCharacter): Promise<void> {
    this.error.set('');
    this.loading.set(true);
    this.charInfo.set(null);
    this.encounters.set([]);
    try {
      const info = await this.wclApi.charLookup(char.name, char.serverSlug, char.serverRegion);
      this.charInfo.set(info);
      if (info.spec) {
        await this._loadEncountersForSpec(info.spec);
      } else {
        this.error.set('Could not auto-detect spec. Enter it manually below.');
      }
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load character.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async applyManualSpec(): Promise<void> {
    const spec = this.manualSpecControl.value.trim();
    if (!spec) return;
    const info = this.charInfo();
    if (!info) return;
    this.charInfo.set({ ...info, spec });
    this.error.set('');
    await this._loadEncountersForSpec(spec);
  }

  private async _loadEncountersForSpec(spec: string): Promise<void> {
    const enc = await this.encounterSvc.getEncounters(spec);
    this.encounters.set(enc);
    if (enc.length) {
      this.encControl.enable({ emitEvent: false });
    } else {
      this.encControl.disable({ emitEvent: false });
      this.error.set(`No parse data ingested yet for ${spec}. Run "npm run ingest" to populate encounter data.`);
    }
  }

  protected async onEncChange(): Promise<void> {
    this.router.navigate([], { queryParams: { encounter: this.selectedEncId() || null }, replaceUrl: true });
    this.bench.set(null);
    this.charGear.set(null);
    this.rulebook.set(null);
    if (!this.selectedEncId()) return;
    const info = this.charInfo();
    if (!info?.spec) return;

    this.loadingBrief.set(true);
    try {
      const [gearData, benchData, rulebookData] = await Promise.all([
        info.name ? this.wclApi.getCharGear(info.name, info.server, info.region, this.selectedEncId()) : Promise.resolve({ found: false }),
        this.encounterSvc.getBench(info.spec, this.selectedEncId()),
        this.encounterSvc.getRulebook(info.spec),
      ]);
      if ((gearData as CharacterGear).found) this.charGear.set(gearData as CharacterGear);
      this.bench.set(benchData);
      this.rulebook.set(rulebookData);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load encounter data.');
    } finally {
      this.loadingBrief.set(false);
    }
  }

  protected slotName(slot: number): string { return SLOT_NAMES[slot] || `Slot ${slot}`; }

  private _fmtTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.round(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  protected fmtDmg(n: number | undefined | null): string {
    if (!n) return '';
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${Math.round(n / 1e3)}K`;
    return String(Math.round(n));
  }

  protected talentStatus(topStats: EncounterGearStats | null): { status: string; note: string } {
    if (!topStats?.talent_builds?.length) return { status: 'unknown', note: 'No talent data yet.' };
    const gear = this.charGear();
    if (!gear?.talent_key) return { status: 'unknown', note: 'Talent data unavailable from WCL.' };
    const pv = gear.talent_key.split(':')[0];
    const tv = (topStats.talent_builds[0]?.key || '').split(':')[0];
    if (pv !== tv) return { status: 'unknown', note: 'Talent comparison unavailable (format mismatch).' };
    const match = topStats.talent_builds.find(b => b.key === gear.talent_key);
    if (match && match.pct >= 40) return { status: 'ok', note: `Matches top parse build (${match.pct}% of parses)` };
    const top = topStats.talent_builds[0];
    return { status: 'warn', note: `Build differs - most common used by ${top?.pct ?? 0}% of top parsers` };
  }

}
