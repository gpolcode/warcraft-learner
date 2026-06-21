// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { AllOriginsResponse, parseWowheadXml, wowheadProxyUrl } from './wowhead-mappers';
import {
  EMPTY_WOWHEAD_XML,
  HTML_ERROR_BODY,
  ITEM_XML,
  MALFORMED_XML,
  SPELL_XML,
} from './__fixtures__/wowhead-fixtures';

/** Wrap a raw upstream body in an allorigins `/get` envelope, as the proxy does. */
function envelope(contents: string, http_code = 200): AllOriginsResponse {
  return { contents, status: { http_code } };
}

describe('parseWowheadXml', () => {
  it('extracts name (CDATA) and icon from item XML', () => {
    expect(parseWowheadXml(envelope(ITEM_XML), 'item')).toEqual({
      ok: true,
      info: { name: 'Gaze of the Alnseer', icon: 'inv_misc_eye_01' },
    });
  });

  it('extracts name and strips a trailing .jpg from the icon slug', () => {
    expect(parseWowheadXml(envelope(SPELL_XML), 'spell')).toEqual({
      ok: true,
      info: { name: 'Shadow Blades', icon: 'ability_rogue_shadowblades' },
    });
  });

  it('fails with a reason when the proxy http_code is not 200', () => {
    const result = parseWowheadXml(envelope(ITEM_XML, 503), 'item');
    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ reason: expect.stringContaining('503') });
  });

  it('fails with a reason on an HTML challenge/error body', () => {
    const result = parseWowheadXml(envelope(HTML_ERROR_BODY), 'item');
    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ reason: expect.stringContaining('HTML') });
  });

  it('fails when the requested entity element is absent', () => {
    const result = parseWowheadXml(envelope(EMPTY_WOWHEAD_XML), 'item');
    expect(result).toEqual({ ok: false, reason: 'no <item> element in response' });
  });

  it('fails on malformed XML rather than throwing', () => {
    const result = parseWowheadXml(envelope(MALFORMED_XML), 'item');
    expect(result.ok).toBe(false);
  });

  it('fails on an empty body', () => {
    expect(parseWowheadXml(envelope(''), 'item')).toEqual({ ok: false, reason: 'empty body' });
    expect(parseWowheadXml(null, 'item')).toEqual({ ok: false, reason: 'empty body' });
  });
});

describe('wowheadProxyUrl', () => {
  it('wraps the Wowhead XML url in the allorigins /get proxy', () => {
    expect(wowheadProxyUrl('item', 260312)).toBe(
      'https://api.allorigins.win/get?url=' +
        encodeURIComponent('https://www.wowhead.com/item=260312?xml'),
    );
  });

  it('uses the spell entity kind for spells', () => {
    expect(wowheadProxyUrl('spell', 121471)).toBe(
      'https://api.allorigins.win/get?url=' +
        encodeURIComponent('https://www.wowhead.com/spell=121471?xml'),
    );
  });
});
