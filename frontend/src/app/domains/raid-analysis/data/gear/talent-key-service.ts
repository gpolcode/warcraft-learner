import { Injectable } from '@angular/core';
import { WclTalentNode } from '../wcl/wcl.models';

@Injectable({ providedIn: 'root' })
export class TalentKeyService {

  // Keyed by entry, not node: WCL can report the same talent under a different nodeID, which would split one build.
  talentKeyFromTree(tree: WclTalentNode[] | undefined): string {
    const picks = (tree ?? [])
      .flatMap(node => (node.id == null ? [] : [{ entryId: node.id, rank: node.rank ?? 1 }]))
      .sort((a, b) => a.entryId - b.entryId);
    if (!picks.length) return '';
    const body = picks
      .map(pick => [pick.entryId, pick.rank].join(FIELD_SEPARATOR))
      .join(PICK_SEPARATOR);
    return `${KEY_PREFIX}:${body}`;
  }

  /** The entries a log's build took, the ids a rule's talent gate names; null when the log carries no combatant info to read them from. */
  takenEntryIds(tree: WclTalentNode[] | undefined): Set<number> | null {
    if (!tree) return null;
    return new Set(tree.flatMap(node => (node.id == null ? [] : [node.id])));
  }

  parseTalentKey(key: string): TalentPick[] {
    const [prefix, body] = key.split(':');
    if (prefix !== KEY_PREFIX || !body) return [];
    return body.split(PICK_SEPARATOR).reduce<TalentPick[]>((picks, part) => {
      const [entryId, rank] = part.split(FIELD_SEPARATOR).map(Number);
      if (entryId != null && rank != null && Number.isFinite(entryId) && Number.isFinite(rank)) picks.push({ entryId, rank });
      return picks;
    }, []);
  }
}

export interface TalentPick {
  entryId: number;
  rank: number;
}

const KEY_PREFIX = 'v3';
const PICK_SEPARATOR = ',';
const FIELD_SEPARATOR = '.';
