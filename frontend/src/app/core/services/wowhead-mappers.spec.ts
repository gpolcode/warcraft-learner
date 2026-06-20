import { describe, it, expect } from 'vitest';
import { tooltipToIcon, wowheadProxyUrl } from './wowhead-mappers';

describe('tooltipToIcon', () => {
  it('maps a tooltip name and icon', () => {
    expect(tooltipToIcon({ name: 'Reshii Wraps', icon: 'inv_cloth_raidpriest' })).toEqual({
      icon: 'inv_cloth_raidpriest',
      name: 'Reshii Wraps',
    });
  });

  it('strips a trailing .jpg from the icon slug', () => {
    expect(tooltipToIcon({ name: 'Shadow Blades', icon: 'inv_knife.jpg' })).toEqual({
      icon: 'inv_knife',
      name: 'Shadow Blades',
    });
  });

  it('returns null when the name is missing', () => {
    expect(tooltipToIcon({ icon: 'inv_knife' })).toBeNull();
    expect(tooltipToIcon({})).toBeNull();
    expect(tooltipToIcon(null)).toBeNull();
  });
});

describe('wowheadProxyUrl', () => {
  it('wraps the Wowhead tooltip url in the allorigins /get proxy', () => {
    expect(wowheadProxyUrl('item', 249344)).toBe(
      'https://api.allorigins.win/get?url=' +
        encodeURIComponent('https://nether.wowhead.com/tooltip/item/249344'),
    );
  });

  it('uses the spell entity kind for spells', () => {
    expect(wowheadProxyUrl('spell', 121471)).toBe(
      'https://api.allorigins.win/get?url=' +
        encodeURIComponent('https://nether.wowhead.com/tooltip/spell/121471'),
    );
  });
});
