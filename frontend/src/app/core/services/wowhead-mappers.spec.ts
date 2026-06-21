// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { parseWowheadXml, wowheadProxyUrl } from './wowhead-mappers';

const ITEM_XML = `<?xml version="1.0" encoding="utf-8"?>
<wowhead>
  <item id="249344">
    <name>Reshii Wraps</name>
    <icon displayId="1">inv_cloth_raidpriest</icon>
  </item>
</wowhead>`;

const SPELL_XML = `<?xml version="1.0" encoding="utf-8"?>
<wowhead>
  <spell id="121471">
    <name>Shadow Blades</name>
    <icon displayId="1">ability_rogue_shadowblades</icon>
  </spell>
</wowhead>`;

describe('parseWowheadXml', () => {
  it('extracts name and icon from item XML', () => {
    expect(parseWowheadXml(ITEM_XML, 'item')).toEqual({
      name: 'Reshii Wraps',
      icon: 'inv_cloth_raidpriest',
    });
  });

  it('extracts name and icon from spell XML', () => {
    expect(parseWowheadXml(SPELL_XML, 'spell')).toEqual({
      name: 'Shadow Blades',
      icon: 'ability_rogue_shadowblades',
    });
  });

  it('strips a trailing .jpg from the icon slug', () => {
    const xml = SPELL_XML.replace('ability_rogue_shadowblades', 'ability_rogue_shadowblades.jpg');
    expect(parseWowheadXml(xml, 'spell')).toEqual({
      name: 'Shadow Blades',
      icon: 'ability_rogue_shadowblades',
    });
  });

  it('returns null when the entity element is missing', () => {
    expect(parseWowheadXml('<wowhead></wowhead>', 'item')).toBeNull();
  });

  it('returns null when name is empty', () => {
    const xml = ITEM_XML.replace('<name>Reshii Wraps</name>', '<name></name>');
    expect(parseWowheadXml(xml, 'item')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(parseWowheadXml('', 'item')).toBeNull();
  });
});

describe('wowheadProxyUrl', () => {
  it('wraps the Wowhead XML url in the allorigins /get proxy', () => {
    expect(wowheadProxyUrl('item', 249344)).toBe(
      'https://api.allorigins.win/get?url=' +
        encodeURIComponent('https://www.wowhead.com/item=249344?xml'),
    );
  });

  it('uses the spell entity kind for spells', () => {
    expect(wowheadProxyUrl('spell', 121471)).toBe(
      'https://api.allorigins.win/get?url=' +
        encodeURIComponent('https://www.wowhead.com/spell=121471?xml'),
    );
  });
});
