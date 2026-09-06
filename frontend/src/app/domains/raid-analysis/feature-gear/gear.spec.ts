import { describe, it, expect } from 'vitest';
import { Clipboard } from '@angular/cdk/clipboard';
import { Result, Results } from '../../shared/util-http/result';
import { mountDom, MountedDom } from '../../../../testing/component-harness';
import { whenStable } from '../../../../testing/when-stable';
import { Gear } from './gear';
import { GearComparisonView, GearFeatureService } from '../data/gear/gear-feature-service';

const SPEC = 'SubtletyRogue';
const ENCOUNTER_ID = 3379;
const COPY_BUTTON = 'button[aria-label="Copy name"]';
const COPIED_BUTTON = 'button[aria-label="Copied"]';
const FAILED_MESSAGE = 'Clipboard write failed. Retry the copy.';
const ARMOR_KIT_ITEM = "Forest Hunter's Armor Kit";
const HELM_ENCHANT = 'Enchant Helm - Empowered Rune of Avoidance';

function benchView(over: Partial<GearComparisonView> = {}): GearComparisonView {
  return {
    comparison: false,
    talentBuilds: [], talentStatus: { status: 'unknown', note: 'No talent data.' },
    trinketSets: [], trinketStatus: { status: 'unknown', note: 'No trinket data.' },
    enchantRows: [], enchantStatus: 'ok',
    benchEnchantRows: [
      { slotName: 'Head', name: HELM_ENCHANT, copyName: HELM_ENCHANT },
      { slotName: 'Legs', name: ARMOR_KIT_ITEM, copyName: ARMOR_KIT_ITEM },
      { slotName: 'Feet', name: 'Enchant #8042', copyName: null },
    ],
    ...over,
  };
}

function comparisonView(): GearComparisonView {
  return benchView({
    comparison: true,
    benchEnchantRows: [],
    enchantRows: [
      { slotName: 'Legs', status: 'warn', name: 'Not enchanted', note: `Most top raiders run ${ARMOR_KIT_ITEM}. Apply it.`, copyName: ARMOR_KIT_ITEM },
      { slotName: 'Head', status: 'ok', name: HELM_ENCHANT, note: null, copyName: null },
    ],
  });
}

interface Mounted {
  readonly dom: MountedDom;
  readonly copies: string[];
}

async function mount(view: GearComparisonView, copySucceeds = true): Promise<Mounted> {
  const copies: string[] = [];
  const load = async (): Promise<Result<GearComparisonView>> => Results.ok(view);
  // The prototype supplies the empty view; only the two IO loads are faked.
  const feature = Object.assign(Object.create(GearFeatureService.prototype) as GearFeatureService, {
    loadBenchView: load, loadComparisonView: load,
  });
  const clipboard = {
    copy: (text: string) => { copies.push(text); return copySucceeds; },
  } as unknown as Clipboard;
  const inputs = view.comparison
    ? { spec: SPEC, encounterId: ENCOUNTER_ID, report: 'abc', fight: 1, player: 10 }
    : { spec: SPEC, encounterId: ENCOUNTER_ID };

  const dom = mountDom(Gear, inputs, [
    { provide: GearFeatureService, useValue: feature },
    { provide: Clipboard, useValue: clipboard },
  ]);
  await whenStable();
  dom.detectChanges();
  return { dom, copies };
}

describe('Gear enchant copy', () => {
  it('offers a copy button only on the bench rows that resolved a name', async () => {
    const { dom } = await mount(benchView());

    expect(dom.queryAll(COPY_BUTTON)).toHaveLength(2);
    expect(dom.text()).toContain(ARMOR_KIT_ITEM);
  });

  it('hands the clipboard the row\'s item name and confirms on that row alone', async () => {
    const { dom, copies } = await mount(benchView());

    dom.queryAll(COPY_BUTTON)[1]?.click();
    dom.detectChanges();

    expect(copies).toEqual([ARMOR_KIT_ITEM]);
    expect(dom.queryAll(COPIED_BUTTON)).toHaveLength(1);
    expect(dom.queryAll(COPY_BUTTON)).toHaveLength(1);
    expect(dom.text()).not.toContain(FAILED_MESSAGE);
  });

  it('reports the failure, and no confirmation, when the clipboard write is refused', async () => {
    const { dom } = await mount(benchView(), false);

    dom.click(COPY_BUTTON);

    expect(dom.text()).toContain(FAILED_MESSAGE);
    expect(dom.query(COPIED_BUTTON)).toBeNull();
  });

  it('offers the consensus item to copy beside the fix on a flagged comparison row', async () => {
    const { dom, copies } = await mount(comparisonView());

    expect(dom.queryAll(COPY_BUTTON)).toHaveLength(1);
    dom.click(COPY_BUTTON);

    expect(copies).toEqual([ARMOR_KIT_ITEM]);
  });
});
