import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { SpecTalents } from '../gear/talent.models';
import { Result, Results } from '../../../shared/util-http/result';
import { HttpLoadErrors } from './http-load-error';
import { LoggerService } from '../../../shared/util-logging/logger-service';

const DUMP_URL = 'https://www.raidbots.com/static/data/live/talents.json';

// subTreeNodes carries the hero-tree pick.
const NODE_BUCKETS = ['classNodes', 'specNodes', 'heroNodes', 'subTreeNodes'] as const;

interface RaidbotsEntry { id?: number; name?: string; icon?: string; spellId?: number; index?: number }
type RaidbotsNode = Partial<Record<(typeof NODE_BUCKETS)[number], never>> & { type?: string; entries?: RaidbotsEntry[] };
type RaidbotsTree = { className: string; specName: string } & Record<(typeof NODE_BUCKETS)[number], RaidbotsNode[] | undefined>;

export interface TalentName {
  id: number;
  name: string;
}

export interface TalentTree {
  talents: TalentName[];
  heroTrees: TalentName[];
  /** One entry per tier, in order, so `apex.N` is the Nth. */
  apex: TalentName[];
}

@Injectable({ providedIn: 'root' })
export class TalentDataService {
  private readonly logger = inject(LoggerService);
  private readonly http = inject(HttpClient);

  async getTalents(spec: string): Promise<Result<SpecTalents>> {
    const trees = await this.fetchTrees();
    if (!trees.ok) return trees;
    const talents = this.indexTalentTrees(trees.value).get(spec);
    return talents ? Results.ok(talents) : Results.missing('No talent data for this spec.');
  }

  /** Keyed like `getTalents`. */
  async getTalentTrees(): Promise<Result<Map<string, TalentTree>>> {
    const trees = await this.fetchTrees();
    return trees.ok ? Results.ok(new Map(trees.value.map(tree => [this.specKey(tree), this.talentTree(tree)]))) : trees;
  }

  private async fetchTrees(): Promise<Result<RaidbotsTree[]>> {
    try {
      const trees = await firstValueFrom(this.http.get<unknown>(DUMP_URL));
      if (!Array.isArray(trees)) throw new TypeError('talents.json is not a tree list');
      return Results.ok(trees as RaidbotsTree[]);
    } catch (cause) {
      this.logger.logWarn('TalentDataService dump fetch', cause);
      return HttpLoadErrors.toLoadError(cause, 'talent-data.dump');
    }
  }

  protected talentTree(tree: RaidbotsTree): TalentTree {
    const named = (nodes: RaidbotsNode[]): TalentName[] => nodes.flatMap(node => (node.entries ?? [])
      .flatMap(entry => (entry.id != null && entry.name ? [{ id: entry.id, name: entry.name }] : [])));
    const tiered = (tree.specNodes ?? []).find(node => node.type === 'tiered');
    return {
      talents: named([...tree.classNodes ?? [], ...tree.specNodes ?? [], ...tree.heroNodes ?? []]),
      heroTrees: named(tree.subTreeNodes ?? []),
      apex: tiered ? named([{ entries: [...tiered.entries ?? []].sort((a, b) => (a.index ?? 0) - (b.index ?? 0)) }]) : [],
    };
  }

  /** Must match the app's WCL-derived `{spec}{class}` folder key. */
  private specKey(tree: RaidbotsTree): string {
    return `${tree.specName}${tree.className}`.replace(/[^A-Za-z]/g, '');
  }

  private nodeTalents(node: RaidbotsNode): SpecTalents {
    const talents: SpecTalents = {};
    for (const entry of node.entries ?? []) {
      if (entry.id == null) continue;
      talents[entry.id] = { name: entry.name ?? '', icon: entry.icon ?? '', ...(entry.spellId ? { spellId: entry.spellId } : {}) };
    }
    return talents;
  }

  private talentsOf(tree: RaidbotsTree): SpecTalents {
    const talents: SpecTalents = {};
    for (const bucket of NODE_BUCKETS) {
      for (const node of tree[bucket] ?? []) Object.assign(talents, this.nodeTalents(node));
    }
    return talents;
  }

  protected indexTalentTrees(trees: RaidbotsTree[]): Map<string, SpecTalents> {
    return new Map(trees.map(tree => [this.specKey(tree), this.talentsOf(tree)]));
  }
}
