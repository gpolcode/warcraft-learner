import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { mountVm } from '../../../../testing/component-harness';
import { GameIcon } from './game-icon';
import { SHADOW_BLADES } from '../../../../testing/spell-ids';

interface GameIconVm {
  wowheadUrl: () => string | null;
  iconUrl: () => string | null;
}

const ARMOR_KIT_ITEM_ID = 244641;

// Each case mounts more than once, so the module resets between mounts.
function icon(inputs: Record<string, unknown>): GameIconVm {
  TestBed.resetTestingModule();
  return mountVm(GameIcon, { name: 'x', icon: '', ...inputs }).vm as unknown as GameIconVm;
}

describe('GameIcon', () => {
  it('links a spell by default and an item by kind', () => {
    expect(icon({ id: SHADOW_BLADES }).wowheadUrl()).toBe(`https://www.wowhead.com/spell=${SHADOW_BLADES}`);
    expect(icon({ id: ARMOR_KIT_ITEM_ID, kind: 'item' }).wowheadUrl()).toBe(`https://www.wowhead.com/item=${ARMOR_KIT_ITEM_ID}`);
  });

  it('links nothing without an id, so the name renders alone', () => {
    expect(icon({}).wowheadUrl()).toBeNull();
    expect(icon({ id: null }).wowheadUrl()).toBeNull();
  });

  it('strips an image extension WCL leaves on the icon file and renders no art for an empty one', () => {
    expect(icon({ id: SHADOW_BLADES, icon: 'ability_rogue_shadowblades.jpg' }).iconUrl())
      .toBe('https://wow.zamimg.com/images/wow/icons/small/ability_rogue_shadowblades.jpg');
    expect(icon({ id: SHADOW_BLADES }).iconUrl()).toBeNull();
  });
});
