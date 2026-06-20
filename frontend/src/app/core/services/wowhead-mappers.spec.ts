// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { parseWowheadXml, wowheadProxyUrl } from './wowhead-mappers';

const ITEM_XML = `<?xml version="1.0" encoding="UTF-8"?>
<wowhead>
  <item id="260312">
    <name><![CDATA[Reshii Wraps]]></name>
    <icon displayId="5678">inv_cloth_raidpriest</icon>
  </item>
</wowhead>`;

const SPELL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<wowhead>
  <spell id="121471">
    <name><![CDATA[Shadow Blades]]></name>
    <icon>inv_knife_1h_grimbatolraid_d_03</icon>
  </spell>
</wowhead>`;

const ERROR_XML = `<?xml version="1.0"?><wowhead><error>Item not found</error></wowhead>`;

describe('parseWowheadXml', () => {
  it('parses item name and icon', () => {
    expect(parseWowheadXml(ITEM_XML, 'item')).toEqual({
      icon: 'inv_cloth_raidpriest',
      name: 'Reshii Wraps',
    });
  });

  it('parses spell name and icon', () => {
    expect(parseWowheadXml(SPELL_XML, 'spell')).toEqual({
      icon: 'inv_knife_1h_grimbatolraid_d_03',
      name: 'Shadow Blades',
    });
  });

  it('returns null on a Wowhead error body', () => {
    expect(parseWowheadXml(ERROR_XML, 'item')).toBeNull();
  });

  it('returns null when the entity is absent', () => {
    expect(parseWowheadXml('<wowhead></wowhead>', 'spell')).toBeNull();
  });

  it('returns null on unparseable input', () => {
    expect(parseWowheadXml('not xml at all <<<', 'item')).toBeNull();
  });
});

describe('wowheadProxyUrl', () => {
  it('encodes the inner Wowhead xml url through the allorigins proxy', () => {
    expect(wowheadProxyUrl('item', 260312)).toBe(
      'https://api.allorigins.win/raw?url=' +
        encodeURIComponent('https://www.wowhead.com/item=260312?xml'),
    );
  });
});
