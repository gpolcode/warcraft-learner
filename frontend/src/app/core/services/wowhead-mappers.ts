import { IconInfo } from './icon-cache';

/** Spell and item are the two Wowhead entity kinds we resolve. */
export type WowheadKind = 'spell' | 'item';

// allorigins exposes two endpoints. `/raw` proxies the body verbatim but is
// unreliable (frequent 5xx / missing CORS headers). `/get` is the documented,
// dependable endpoint: it always returns JSON `{ contents, status }` with
// proper CORS headers. See https://github.com/gnuns/allorigins.
const PROXY_BASE = 'https://api.allorigins.win/get?url=';

/**
 * Build the CORS-proxy URL for a spell or item.
 *
 * We target Wowhead's XML endpoint (`?xml`), which returns well-structured XML
 * with `<name>` and `<icon>` elements. The allorigins `/get` wrapper delivers
 * it as `{ contents: "<xml...>" }` JSON with reliable CORS headers.
 */
export function wowheadProxyUrl(kind: WowheadKind, id: number): string {
  const target = `https://www.wowhead.com/${kind}=${id}?xml`;
  return `${PROXY_BASE}${encodeURIComponent(target)}`;
}

/** The allorigins `/get` envelope - `contents` is the upstream body as a string. */
export interface AllOriginsResponse {
  contents: string;
}

/**
 * Parse Wowhead XML and extract icon/name. Returns null when the entity is
 * missing or the XML is malformed, so the caller can degrade gracefully.
 *
 * Wowhead XML looks like:
 * `<wowhead><item><name>...</name><icon>...</icon>...</item></wowhead>`
 * The element tag is `<item>` for items and `<spell>` for spells.
 */
export function parseWowheadXml(xml: string, kind: WowheadKind): IconInfo | null {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const entity = doc.querySelector(kind);
  if (!entity) return null;
  const name = entity.querySelector('name')?.textContent?.trim() ?? '';
  const icon = (entity.querySelector('icon')?.textContent?.trim() ?? '').replace(/\.jpg$/i, '');
  if (!name) return null;
  return { icon, name };
}
