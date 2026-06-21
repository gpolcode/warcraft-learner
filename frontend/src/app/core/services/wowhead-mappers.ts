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
 * Targets Wowhead's XML endpoint (`?xml`), whose `<name>`/`<icon>` shape is
 * stable and documented. allorigins `/get` delivers it as
 * `{ contents: "<xml>", status: { http_code } }` with reliable CORS headers.
 */
export function wowheadProxyUrl(kind: WowheadKind, id: number): string {
  const target = `https://www.wowhead.com/${kind}=${id}?xml`;
  return `${PROXY_BASE}${encodeURIComponent(target)}`;
}

/** The allorigins `/get` envelope - `contents` is the upstream body as a string. */
export interface AllOriginsResponse {
  contents: string;
  status?: { http_code?: number };
}

/**
 * Result of resolving a Wowhead response. The failure carries a human-readable
 * `reason` so the transport layer can log *why* a lookup produced no icon
 * instead of silently returning null - the whole point of this rework was that
 * the real failure was being swallowed.
 */
export type WowheadResolveResult =
  | { ok: true; info: IconInfo }
  | { ok: false; reason: string };

/** True when a body is an HTML page (Cloudflare / error / challenge), not XML. */
function looksLikeHtml(body: string): boolean {
  const head = body.slice(0, 200).toLowerCase();
  return head.includes('<!doctype html') || head.includes('<html');
}

/**
 * Parse an allorigins `/get` envelope wrapping a Wowhead `?xml` body into an
 * icon/name. Returns a discriminated result: `ok` with the `IconInfo`, or a
 * failure with a diagnostic `reason`. `DOMParser` decodes `<![CDATA[..]]>` in
 * `<name>` natively, so CDATA needs no special handling here.
 *
 * Wowhead XML shape:
 * `<wowhead><item id="..">...<name><![CDATA[..]]></name><icon ...>file</icon></item></wowhead>`
 * (`<spell>` for spells). The element tag equals `kind`.
 */
export function parseWowheadXml(
  envelope: AllOriginsResponse | null,
  kind: WowheadKind,
): WowheadResolveResult {
  const httpCode = envelope?.status?.http_code;
  if (httpCode != null && httpCode !== 200) {
    return { ok: false, reason: `proxy http_code ${httpCode}` };
  }

  const contents = (envelope?.contents ?? '').trim();
  if (!contents) return { ok: false, reason: 'empty body' };
  if (looksLikeHtml(contents)) {
    return { ok: false, reason: 'HTML body (challenge / error page), not XML' };
  }

  const doc = new DOMParser().parseFromString(contents, 'text/xml');
  if (doc.querySelector('parsererror')) {
    return { ok: false, reason: 'XML parse error' };
  }

  const entity = doc.querySelector(kind);
  if (!entity) return { ok: false, reason: `no <${kind}> element in response` };

  const name = entity.querySelector('name')?.textContent?.trim() ?? '';
  const icon = (entity.querySelector('icon')?.textContent?.trim() ?? '').replace(/\.jpg$/i, '');
  if (!name) return { ok: false, reason: `<${kind}> has no <name>` };

  return { ok: true, info: { icon, name } };
}
