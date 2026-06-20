import { IconInfo } from './icon-cache';

/** Spell and item are the two Wowhead entity kinds we resolve. */
export type WowheadKind = 'spell' | 'item';

// allorigins exposes two endpoints. `/raw` proxies the body verbatim but is
// unreliable (frequent 5xx / missing CORS headers - the failure seen in the
// browser console). `/get` is the documented, dependable endpoint: it always
// returns JSON `{ contents, status }` with proper CORS headers.
// See https://github.com/gnuns/allorigins.
const PROXY_BASE = 'https://api.allorigins.win/get?url=';

/**
 * Build the CORS-proxy URL for a spell or item.
 *
 * We hit Wowhead's tooltip endpoint, which already returns JSON (`name`,
 * `icon`, ...), so there is no XML to hand-parse - Angular's HttpClient decodes
 * it natively. The Wowhead URL is encoded so it survives the outer `url=` param.
 */
export function wowheadProxyUrl(kind: WowheadKind, id: number): string {
  const target = `https://nether.wowhead.com/tooltip/${kind}/${id}`;
  return `${PROXY_BASE}${encodeURIComponent(target)}`;
}

/** The allorigins `/get` envelope - `contents` is the upstream body as a string. */
export interface AllOriginsResponse {
  contents: string;
}

/** The fields we need from a Wowhead tooltip JSON payload. */
export interface WowheadTooltip {
  name?: string;
  icon?: string;
}

/**
 * Map a Wowhead tooltip payload to an icon/name. Returns null when the entity
 * is missing (no name), so the caller can degrade to a plain Wowhead link.
 */
export function tooltipToIcon(tooltip: WowheadTooltip | null): IconInfo | null {
  const name = tooltip?.name?.trim();
  if (!tooltip || !name) return null;
  const icon = (tooltip.icon ?? '').trim().replace(/\.jpg$/i, '');
  return { icon, name };
}
