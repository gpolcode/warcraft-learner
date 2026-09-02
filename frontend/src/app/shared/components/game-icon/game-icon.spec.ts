import { describe, it, expect } from 'vitest';
import { GameIcon } from './game-icon';
import { mountDom } from '../../../../testing/component-harness';
import { SHADOW_BLADES } from '../../../../testing/spell-ids';

const NAME = 'Shadow Blades';

const render = (inputs: Record<string, unknown>) =>
  mountDom(GameIcon, { id: SHADOW_BLADES, name: NAME, icon: '', ...inputs });

describe('GameIcon', () => {
  it('links the icon and name to Wowhead for the given spell id', () => {
    const dom = render({});

    const link = dom.query('a');
    expect(link?.getAttribute('href')).toBe(`https://www.wowhead.com/spell=${SHADOW_BLADES}`);
    expect(dom.text()).toContain(NAME);
  });

  it('builds item links from the kind input', () => {
    const dom = render({ kind: 'item' });

    expect(dom.query('a')?.getAttribute('href')).toBe(`https://www.wowhead.com/item=${SHADOW_BLADES}`);
  });

  it('renders the icon art for a named icon file', () => {
    const dom = render({ icon: 'shadow_blades' });

    expect(dom.query('img')?.getAttribute('src')).toContain('shadow_blades.jpg');
  });

  it('renders name-only when the icon is empty', () => {
    const dom = render({ icon: '' });

    expect(dom.query('img')).toBeNull();
    expect(dom.text()).toContain(NAME);
  });

  it('renders name-only without a link when the id is null or undefined', () => {
    for (const id of [null, undefined]) {
      const dom = render({ id });

      const link = dom.query('a');
      expect(link?.getAttribute('href')).toBeNull();
      expect(dom.query('img')).toBeNull();
      expect(dom.text()).toContain(NAME);
    }
  });

  it('drops a failed image and keeps the name', () => {
    const dom = render({ icon: 'shadow_blades' });

    const img = dom.query('img');
    if (!img) throw new Error('expected the icon img to render');
    dom.dispatch(img, new Event('error'));

    expect(dom.query('img')).toBeNull();
    expect(dom.text()).toContain(NAME);
  });
});
