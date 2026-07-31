import { WclTalentNode } from '../../core/models/wcl.models';

export interface TalentPick {
  nodeId: number;
  entryId: number;
  rank: number;
}

const KEY_PREFIX = 'v3';
const PICK_SEPARATOR = ',';
const FIELD_SEPARATOR = '.';

/** Ordered by node so the key is byte-stable across parses; entry and rank keep near-identical builds apart. */
export function talentKeyFromTree(tree: WclTalentNode[] | undefined): string {
  const picks = (tree ?? [])
    .filter(node => node.nodeID != null && node.id != null)
    .map(node => ({ nodeId: node.nodeID!, entryId: node.id!, rank: node.rank ?? 1 }))
    .sort((a, b) => a.nodeId - b.nodeId);
  if (!picks.length) return '';
  const body = picks
    .map(pick => [pick.nodeId, pick.entryId, pick.rank].join(FIELD_SEPARATOR))
    .join(PICK_SEPARATOR);
  return `${KEY_PREFIX}:${body}`;
}

export function parseTalentKey(key: string): TalentPick[] {
  const [prefix, body] = key.split(':');
  if (prefix !== KEY_PREFIX || !body) return [];
  return body.split(PICK_SEPARATOR).reduce<TalentPick[]>((picks, part) => {
    const [nodeId, entryId, rank] = part.split(FIELD_SEPARATOR).map(Number);
    if (Number.isFinite(nodeId) && Number.isFinite(entryId) && Number.isFinite(rank)) {
      picks.push({ nodeId, entryId, rank });
    }
    return picks;
  }, []);
}
