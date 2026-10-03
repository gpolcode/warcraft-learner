import { describe, it, expect } from 'vitest';
import { Result, Results } from '../../shared/util-http/result';
import { mountDom, MountedDom, MountedOverlay, overlayOf } from '../../../../testing/component-harness';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastService } from '../../shared/util-toast/toast-service';
import { NorthernSkyExport } from './northern-sky-export';
import { NorthernSkyFeatureService } from '../data/northern-sky/northern-sky-feature-service';
import { NorthernSkyAbility, NorthernSkyBench } from '../data/northern-sky/northern-sky-data-source';
import { SHADOW_BLADES, EVASION } from '../../../../testing/spell-ids';
import { whenStable } from '../../../../testing/when-stable';
import { NORTHERN_SKY_ENCOUNTER_ID, NORTHERN_SKY_SPEC, bench } from '../data/northern-sky/northern-sky-harness';

const CAST_TIMES_S = [10, 30];
const EXPORT_BUTTON = 'button[variant="outline"]';
const COPY_BUTTON = 'button[hlmBtn]:not([variant])';
const CHECKBOX = 'hlm-checkbox button[role="checkbox"]';
const PANEL_INTRO = 'Pick the abilities you want timings for, copy the note, and paste it into your Northern Sky addon.';
const COPIED_MESSAGE = 'Copied to clipboard. Paste it into your Northern Sky note.';
const FAILED_MESSAGE = 'Clipboard write failed. Retry the copy.';

function ability(spellId: number, kind: NorthernSkyAbility['kind']): NorthernSkyAbility {
  return { spell_id: spellId, name: `name_${spellId}`, icon: `icon_${spellId}`, kind, cast_times_s: CAST_TIMES_S };
}

const POPULATED_ABILITIES = [ability(SHADOW_BLADES, 'cooldown'), ability(EVASION, 'defensive')];

interface Mounted {
  readonly dom: MountedDom;
  readonly copies: string[];
  readonly messages: string[];
}

async function mount(
  getExport: () => Promise<Result<NorthernSkyBench>>,
  copySucceeds = true,
): Promise<Mounted> {
  const copies: string[] = [];
  const messages: string[] = [];
  // The prototype supplies the real panel and note methods; only the stored and fetched values are faked.
  const feature = Object.assign(Object.create(NorthernSkyFeatureService.prototype) as NorthernSkyFeatureService, {
    getExport,
    loadExcluded: () => new Set<number>(),
    saveExcluded: () => undefined,
  });

  const dom = mountDom(NorthernSkyExport, { spec: NORTHERN_SKY_SPEC, encounterId: NORTHERN_SKY_ENCOUNTER_ID }, [
    { provide: NorthernSkyFeatureService, useValue: feature },
    { provide: Clipboard, useValue: { copy: (text: string) => { copies.push(text); return copySucceeds; } } },
    { provide: ToastService, useValue: { show: (message: string) => { messages.push(message); } } },
  ]);
  await whenStable();
  dom.detectChanges();
  return { dom, copies, messages };
}

describe('NorthernSkyExport export availability', () => {
  it('waits, with no error banner, when the bench carries no abilities', async () => {
    const { dom } = await mount(async () => Results.ok(bench()));

    expect(dom.query('wl-load-state')).not.toBeNull();
    expect(dom.query(EXPORT_BUTTON)).toBeNull();
    expect(dom.text()).toContain('Waiting for top logs');
  });

  it('offers the export button once the bench carries at least one ability', async () => {
    const { dom } = await mount(async () => Results.ok(bench({ abilities: POPULATED_ABILITIES })));

    expect(dom.query('wl-load-state')).toBeNull();
    expect(dom.query(EXPORT_BUTTON)).not.toBeNull();
    expect(dom.text()).toContain('Northern Sky export');
  });

  it('shows the load error instead of the export button when the bench fails to load', async () => {
    const MESSAGE = 'WCL is unreachable right now.';
    const { dom } = await mount(async () => Results.transient(MESSAGE));

    expect(dom.query(EXPORT_BUTTON)).toBeNull();
    expect(dom.text()).toContain(MESSAGE);
  });
});

describe('NorthernSkyExport copy', () => {
  const openPanel = async (copySucceeds = true): Promise<Mounted & { panel: MountedOverlay }> => {
    const mounted = await mount(async () => Results.ok(bench({ abilities: POPULATED_ABILITIES })), copySucceeds);
    mounted.dom.click(EXPORT_BUTTON);
    await whenStable();
    return { ...mounted, panel: overlayOf(mounted.dom) };
  };

  it('opens the export panel with a copy action and one checkbox per ability', async () => {
    const { panel } = await openPanel();

    expect(panel.query(COPY_BUTTON)).not.toBeNull();
    expect(panel.queryAll(CHECKBOX)).toHaveLength(POPULATED_ABILITIES.length);
  });

  it('says what the export panel does under its heading', async () => {
    const { panel } = await openPanel();

    expect(panel.text()).toContain(PANEL_INTRO);
  });

  it('confirms the copy, and hands the clipboard a note naming every selected ability', async () => {
    const { panel, copies, messages } = await openPanel();

    panel.click(COPY_BUTTON);

    expect(messages).toEqual([COPIED_MESSAGE]);
    expect(copies).toHaveLength(1);
    expect(copies[0]).toContain(`spellid:${SHADOW_BLADES}`);
    expect(copies[0]).toContain(`spellid:${EVASION}`);
  });

  it('reports the failure, and no confirmation, when the clipboard write is refused', async () => {
    const { panel, messages } = await openPanel(false);

    panel.click(COPY_BUTTON);

    expect(messages).toEqual([FAILED_MESSAGE]);
  });

  it('keeps the confirmation off the panel, so the ability list never shifts under the copy button', async () => {
    const { panel } = await openPanel();

    panel.click(COPY_BUTTON);

    expect(panel.text()).not.toContain(COPIED_MESSAGE);
  });

  it('leaves a deselected ability out of the copied note', async () => {
    const { dom, panel, copies } = await openPanel();

    panel.queryAll(CHECKBOX)[0]?.click();
    dom.detectChanges();
    panel.click(COPY_BUTTON);

    expect(copies[0]).not.toContain(`spellid:${SHADOW_BLADES}`);
    expect(copies[0]).toContain(`spellid:${EVASION}`);
  });

  it('drops every ability from the note on deselect all', async () => {
    const { panel, copies } = await openPanel();

    panel.click('button[variant="ghost"][size="sm"]');
    panel.click(COPY_BUTTON);

    expect(copies[0]).not.toContain('spellid:');
  });
});
