import { describe, it, expect } from 'vitest';
import { Result, Results } from '../../shared/util-http/result';
import { mountDom, MountedDom, mountVm } from '../../../../testing/component-harness';
import { whenStable } from '../../../../testing/when-stable';
import { Clipboard } from '@angular/cdk/clipboard';
import { Gear } from './gear';
import { GearComparisonView, GearFeatureService } from '../data/gear/gear-feature-service';

const SPEC = 'SubtletyRogue';
const ENCOUNTER_ID = 3379;
const COPY_BUTTON = 'wl-game-icon button[tuiButton]';
const ITEM_LINK = 'a[href*="wowhead.com/item="]';
const COPY_LABEL = 'Copy name';
const COPIED_LABEL = 'Copied';
// The rows a talent list shows until its own +N more is pressed, as gear.ts clamps it.
const CHIP_ROWS = 2;
const ARMOR_KIT_ITEM_ID = 244641;
const ARMOR_KIT = { name: "Forest Hunter's Armor Kit", itemId: ARMOR_KIT_ITEM_ID, icon: 'inv_kit' };
const HELM_ENCHANT = { name: 'Enchant Helm - Empowered Rune of Avoidance', itemId: null, icon: '' };

function benchView(over: Partial<GearComparisonView> = {}): GearComparisonView {
  return {
    comparison: false,
    talentBuilds: [], talentStatus: { status: 'unknown', note: 'No talent data.' },
    trinketSets: [], trinketStatus: { status: 'unknown', note: 'No trinket data.' },
    enchantRows: [], enchantStatus: 'ok',
    benchEnchantRows: [
      { slotName: 'Head', enchant: HELM_ENCHANT },
      { slotName: 'Legs', enchant: ARMOR_KIT },
    ],
    ...over,
  };
}

function comparisonView(): GearComparisonView {
  return benchView({
    comparison: true,
    benchEnchantRows: [],
    enchantRows: [
      { slotName: 'Legs', status: 'warn', name: 'Not enchanted', note: 'Most top raiders use it. Apply it.', top: ARMOR_KIT },
      { slotName: 'Head', status: 'ok', name: HELM_ENCHANT.name, note: null, top: null },
    ],
  });
}

function featureOf(view: GearComparisonView): GearFeatureService {
  const load = async (): Promise<Result<GearComparisonView>> => Results.ok(view);
  // The prototype supplies the empty view; only the two IO loads are faked.
  return Object.assign(Object.create(GearFeatureService.prototype) as GearFeatureService, { loadBenchView: load, loadComparisonView: load });
}

interface Mounted {
  readonly dom: MountedDom;
  readonly copies: string[];
}

async function mount(view: GearComparisonView): Promise<Mounted> {
  const copies: string[] = [];
  const inputs = view.comparison
    ? { spec: SPEC, encounterId: ENCOUNTER_ID, report: 'abc', fight: 1, player: 10 }
    : { spec: SPEC, encounterId: ENCOUNTER_ID };

  const dom = mountDom(Gear, inputs, [
    { provide: GearFeatureService, useValue: featureOf(view) },
    { provide: Clipboard, useValue: { copy: (text: string) => { copies.push(text); return true; } } },
  ]);
  await whenStable();
  dom.detectChanges();
  return { dom, copies };
}

describe('Gear enchant copy', () => {
  it('links the enchant to its item only where the bench resolved one, and gives every row a copy button', async () => {
    const { dom } = await mount(benchView());

    expect(dom.textAll(COPY_BUTTON)).toEqual([COPY_LABEL, COPY_LABEL]);
    expect(dom.queryAll(ITEM_LINK).map(link => link.getAttribute('href'))).toEqual([`https://www.wowhead.com/item=${ARMOR_KIT_ITEM_ID}`]);
    expect(dom.text()).toContain(HELM_ENCHANT.name);
  });

  it('hands the clipboard the row\'s item name and reads Copied on that button alone', async () => {
    const { dom, copies } = await mount(benchView());

    dom.queryAll(COPY_BUTTON)[1]?.click();
    dom.detectChanges();

    expect(copies).toEqual([ARMOR_KIT.name]);
    expect(dom.textAll(COPY_BUTTON)).toEqual([COPY_LABEL, COPIED_LABEL]);
  });

  it('shows the consensus item beside the fix on a flagged comparison row and offers it to copy', async () => {
    const { dom, copies } = await mount(comparisonView());

    expect(dom.queryAll(ITEM_LINK)).toHaveLength(1);
    expect(dom.queryAll(COPY_BUTTON)).toHaveLength(1);
    dom.click(COPY_BUTTON);

    expect(copies).toEqual([ARMOR_KIT.name]);
  });
});

describe('Gear talent chip lists', () => {
  it('opens only the list whose +N more was pressed, so the other lists stay clamped', () => {
    const { vm } = mountVm(Gear, { spec: SPEC, encounterId: ENCOUNTER_ID }, [{ provide: GearFeatureService, useValue: featureOf(benchView()) }]);
    const added: unknown[] = [];
    const dropped: unknown[] = [];

    expect(vm['chipLines'](added)).toBe(CHIP_ROWS);
    vm['showAllChips'](added);

    expect(vm['chipLines'](added)).toBe(Number.POSITIVE_INFINITY);
    expect(vm['chipLines'](dropped)).toBe(CHIP_ROWS);
  });
});
