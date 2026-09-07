import { describe, it, expect } from 'vitest';
import { Result, Results } from '../../shared/util-http/result';
import { mountDom, MountedDom } from '../../../../testing/component-harness';
import { SelectionStore } from '../data/selection/selection-store';
import { SnackbarService } from '../../shared/ui-snackbar/snackbar-service';
import { NorthernSkyExport } from './northern-sky-export';
import { NorthernSkyFeatureService } from '../data/northern-sky/northern-sky-feature-service';
import { NorthernSkyAbility, NorthernSkyBench } from '../data/northern-sky/northern-sky-data-source';
import { SHADOW_BLADES, EVASION } from '../../../../testing/spell-ids';
import { whenStable } from '../../../../testing/when-stable';
import { NORTHERN_SKY_ENCOUNTER_ID, NORTHERN_SKY_SPEC, bench } from '../data/northern-sky/northern-sky-harness';

const CAST_TIMES_S = [10, 30];
const EXPORT_BUTTON = 'button[mat-stroked-button]';
const COPY_BUTTON = 'button[mat-flat-button]';
const CHECKBOX = 'mat-checkbox input[type="checkbox"]';
const PANEL_INTRO = 'Pick the abilities you want timings for, copy the note, and paste it into your Northern Sky addon.';
const COPIED_MESSAGE = 'Copied to clipboard. Paste it into your Northern Sky note.';

function ability(spellId: number, kind: NorthernSkyAbility['kind']): NorthernSkyAbility {
  return { spell_id: spellId, name: `name_${spellId}`, icon: `icon_${spellId}`, kind, cast_times_s: CAST_TIMES_S };
}

const POPULATED_ABILITIES = [ability(SHADOW_BLADES, 'cooldown'), ability(EVASION, 'defensive')];

interface Mounted {
  readonly dom: MountedDom;
  readonly copies: string[];
  readonly messages: string[];
}

async function mount(getExport: () => Promise<Result<NorthernSkyBench>>): Promise<Mounted> {
  const copies: string[] = [];
  const messages: string[] = [];
  // The prototype supplies the real panel and note methods; only the IO read is faked.
  const feature = Object.assign(Object.create(NorthernSkyFeatureService.prototype) as NorthernSkyFeatureService, { getExport });
  const selection = { loadNorthernSky: () => null, saveNorthernSky: () => undefined } as unknown as SelectionStore;
  const snackbar = {
    copyAndConfirm: (text: string, confirmation: string) => { copies.push(text); messages.push(confirmation); },
  } as unknown as SnackbarService;

  const dom = mountDom(NorthernSkyExport, { spec: NORTHERN_SKY_SPEC, encounterId: NORTHERN_SKY_ENCOUNTER_ID }, [
    { provide: NorthernSkyFeatureService, useValue: feature },
    { provide: SelectionStore, useValue: selection },
    { provide: SnackbarService, useValue: snackbar },
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
  const openPanel = async (): Promise<Mounted> => {
    const mounted = await mount(async () => Results.ok(bench({ abilities: POPULATED_ABILITIES })));
    mounted.dom.click(EXPORT_BUTTON);
    return mounted;
  };

  it('opens the export panel with a copy action and one checkbox per ability', async () => {
    const { dom } = await openPanel();

    expect(dom.query(COPY_BUTTON)).not.toBeNull();
    expect(dom.queryAll(CHECKBOX)).toHaveLength(POPULATED_ABILITIES.length);
  });

  it('says what the export panel does under its heading', async () => {
    const { dom } = await openPanel();

    expect(dom.text()).toContain(PANEL_INTRO);
  });

  it('confirms the copy, and hands the clipboard a note naming every selected ability', async () => {
    const { dom, copies, messages } = await openPanel();

    dom.click(COPY_BUTTON);

    expect(messages).toEqual([COPIED_MESSAGE]);
    expect(copies).toHaveLength(1);
    expect(copies[0]).toContain(`spellid:${SHADOW_BLADES}`);
    expect(copies[0]).toContain(`spellid:${EVASION}`);
  });

  it('keeps the confirmation off the panel, so the ability list never shifts under the copy button', async () => {
    const { dom } = await openPanel();

    dom.click(COPY_BUTTON);

    expect(dom.text()).not.toContain(COPIED_MESSAGE);
  });

  it('leaves a deselected ability out of the copied note', async () => {
    const { dom, copies } = await openPanel();

    dom.queryAll(CHECKBOX)[0]?.click();
    dom.detectChanges();
    dom.click(COPY_BUTTON);

    expect(copies[0]).not.toContain(`spellid:${SHADOW_BLADES}`);
    expect(copies[0]).toContain(`spellid:${EVASION}`);
  });

  it('drops every ability from the note on deselect all', async () => {
    const { dom, copies } = await openPanel();

    dom.click('button[mat-button]');
    dom.click(COPY_BUTTON);

    expect(copies[0]).not.toContain('spellid:');
  });
});
