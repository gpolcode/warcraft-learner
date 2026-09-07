import { describe, it, expect } from 'vitest';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Result, Results } from '../../shared/util-http/result';
import { mountDom, MountedDom } from '../../../../testing/component-harness';
import { whenStable } from '../../../../testing/when-stable';
import { Gear } from './gear';
import { GearComparisonView, GearFeatureService } from '../data/gear/gear-feature-service';

const SPEC = 'SubtletyRogue';
const ENCOUNTER_ID = 3379;
const COPY_BUTTON = 'button[aria-label="Copy name"]';
const ITEM_LINK = 'a[href*="wowhead.com/item="]';
const COPIED_MESSAGE = 'Copied to clipboard. Paste it into the auction house search.';
const FAILED_MESSAGE = 'Clipboard write failed. Retry the copy.';
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
      { slotName: 'Legs', status: 'warn', name: 'Not enchanted', note: 'Most top raiders run it. Apply it.', top: ARMOR_KIT },
      { slotName: 'Head', status: 'ok', name: HELM_ENCHANT.name, note: null, top: null },
    ],
  });
}

interface Mounted {
  readonly dom: MountedDom;
  readonly copies: string[];
  readonly messages: string[];
}

async function mount(view: GearComparisonView, copySucceeds = true): Promise<Mounted> {
  const copies: string[] = [];
  const messages: string[] = [];
  const load = async (): Promise<Result<GearComparisonView>> => Results.ok(view);
  // The prototype supplies the empty view; only the two IO loads are faked.
  const feature = Object.assign(Object.create(GearFeatureService.prototype) as GearFeatureService, {
    loadBenchView: load, loadComparisonView: load,
  });
  const clipboard = {
    copy: (text: string) => { copies.push(text); return copySucceeds; },
  } as unknown as Clipboard;
  const snackBar = { open: (message: string) => { messages.push(message); } } as unknown as MatSnackBar;
  const inputs = view.comparison
    ? { spec: SPEC, encounterId: ENCOUNTER_ID, report: 'abc', fight: 1, player: 10 }
    : { spec: SPEC, encounterId: ENCOUNTER_ID };

  const dom = mountDom(Gear, inputs, [
    { provide: GearFeatureService, useValue: feature },
    { provide: Clipboard, useValue: clipboard },
    { provide: MatSnackBar, useValue: snackBar },
  ]);
  await whenStable();
  dom.detectChanges();
  return { dom, copies, messages };
}

describe('Gear enchant copy', () => {
  it('links the enchant to its item only where the bench resolved one, and offers every row to copy', async () => {
    const { dom } = await mount(benchView());

    expect(dom.queryAll(COPY_BUTTON)).toHaveLength(2);
    expect(dom.queryAll(ITEM_LINK).map(link => link.getAttribute('href'))).toEqual([`https://www.wowhead.com/item=${ARMOR_KIT_ITEM_ID}`]);
    expect(dom.text()).toContain(HELM_ENCHANT.name);
  });

  it('hands the clipboard the row\'s item name and confirms the copy', async () => {
    const { dom, copies, messages } = await mount(benchView());

    dom.queryAll(COPY_BUTTON)[1]?.click();

    expect(copies).toEqual([ARMOR_KIT.name]);
    expect(messages).toEqual([COPIED_MESSAGE]);
  });

  it('reports the failure, and no confirmation, when the clipboard write is refused', async () => {
    const { dom, messages } = await mount(benchView(), false);

    dom.click(COPY_BUTTON);

    expect(messages).toEqual([FAILED_MESSAGE]);
  });

  it('shows the consensus item beside the fix on a flagged comparison row and offers it to copy', async () => {
    const { dom, copies } = await mount(comparisonView());

    expect(dom.queryAll(ITEM_LINK)).toHaveLength(1);
    expect(dom.queryAll(COPY_BUTTON)).toHaveLength(1);
    dom.click(COPY_BUTTON);

    expect(copies).toEqual([ARMOR_KIT.name]);
  });
});
