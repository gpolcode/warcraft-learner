import { IconInfo } from './icon-cache';

/** Spell and item are the two Wowhead entity kinds we resolve. */
export type WowheadKind = 'spell' | 'item';

const ALLORIGINS_BASE = 'https://api.allorigins.win/raw?url=';

/**
 * Build the CORS-proxy URL that returns Wowhead's XML for a spell or item.
 *
 * Wowhead has no public API and its pages cannot be fetched directly from the
 * browser (CORS), so the request is routed through allorigins. The inner
 * Wowhead URL is encoded so its `?xml` query survives the outer `url=` param.
 */
export function wowheadProxyUrl(kind: WowheadKind, id: number): string {
  const target = `https://www.wowhead.com/${kind}=${id}?xml`;
  return `${ALLORIGINS_BASE}${encodeURIComponent(target)}`;
}

/**
 * Parse Wowhead XML into an icon filename + display name.
 *
 * Pure - no Angular/HTTP deps so it is unit-testable in isolation. Returns null
 * when the entity is missing (Wowhead emits an `<error>` element / no name), or
 * when the body cannot be parsed.
 */
export function parseWowheadXml(xml: string, kind: WowheadKind): IconInfo | null {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  if (doc.querySelector('parsererror') || doc.querySelector('error')) return null;

  const entity = doc.querySelector(kind);
  if (!entity) return null;

  const name = entity.querySelector('name')?.textContent?.trim();
  if (!name) return null;

  const icon = (entity.querySelector('icon')?.textContent ?? '').trim().replace(/\.jpg$/i, '');
  return { icon, name };
}
