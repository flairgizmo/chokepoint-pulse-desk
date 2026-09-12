import { describe, expect, it } from 'vitest';
import { chipFromId, chipsFromIds, sameDeskPath, stageRoute } from '../src/ui/relate';
import { resolveStage } from '../src/ui/resolve';
import { stageMarkup } from '../src/ui/stage';
import { diagramSvg } from '../src/ui/diagrams';
import { renderHome, renderStory, renderTechnology } from '../src/ui/pages';

describe('Stage primitive', () => {
  it('ships object, stake, stay, and labelled dialog chrome', () => {
    const html = stageMarkup();
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('desk-stage-title');
    expect(html).toContain('desk-stage-stake');
    expect(html).toContain('desk-stage-visual');
    expect(html).toContain('desk-stage-sheet');
    expect(html).not.toContain('desk-stage-panel');
  });

  it('resolves a person with analogy, sourced fact, and child-stage chips', () => {
    const doc = resolveStage('person', 'verdian');
    expect(doc?.stake).toMatch(/Gilbert Verdian/);
    expect(doc?.analogy?.length).toBeGreaterThan(20);
    expect(doc?.visual).toContain('<svg');
    expect(doc?.related?.some((r) => r.kind === 'tech' && r.id === 'overledger')).toBe(true);
    expect(doc?.related?.every((r) => r.kind && r.id && r.label)).toBe(true);
    expect(doc?.original?.label).toMatch(/Open original/i);
  });

  it('resolves news as an on-site brief, not a leave-the-desk card', () => {
    const el = {
      dataset: {
        title: 'Quant selected for GBTD technology',
        source: 'UK Finance',
        published: '2025-09-26',
        url: 'https://example.com',
        lane: 'Official',
      },
    } as unknown as HTMLElement;
    const doc = resolveStage('news', 'n1', el);
    expect(doc?.body).toMatch(/stay here|brief/i);
    expect(doc?.analogy).toMatch(/pulse/i);
    expect(doc?.related?.some((r) => r.id === 'gbtd')).toBe(true);
    expect(doc?.original?.href).toBe('https://example.com');
  });

  it('maps related ids to the most specific stage kind', () => {
    expect(chipFromId('verdian')).toEqual({ kind: 'person', id: 'verdian', label: 'Gilbert Verdian' });
    expect(chipFromId('overledger')?.kind).toBe('tech');
    expect(chipFromId('patent-us')?.kind).toBe('patent');
    expect(chipFromId('gbtd')?.kind).toBe('programme');
    expect(chipFromId('iso')?.kind).toBe('institution');
    expect(chipFromId('qnt')?.kind).toBe('term');
    expect(chipsFromIds(['riley', 'satp', '/technology']).map((c) => c.kind)).toEqual(['person', 'tech']);
  });

  it('keeps hash routing on the current desk path', () => {
    expect(stageRoute('person')).toBe('/people');
    expect(sameDeskPath('/people', '/people')).toBe(true);
    expect(sameDeskPath('/timeline', '/story')).toBe(true);
    expect(sameDeskPath('/', '/people')).toBe(false);
  });
});

describe('Kind-specific objects', () => {
  it('does not reuse one lattice for every beat', () => {
    const person = diagramSvg('verdian', 'person', 'GV');
    const patent = diagramSvg('patent-us', 'patent', 'US11842335B2');
    const news = diagramSvg('n1', 'news', 'Official');
    const event = diagramSvg('iso-2015', 'event', '2015');
    expect(person).toContain('GV');
    expect(patent).toContain('CLAIM SEQUENCE');
    expect(news).not.toBe(patent);
    expect(event).toContain('2015');
    expect(person).not.toEqual(news);
  });
});

describe('Home and Technology against V2 brochure rejects', () => {
  it('keeps the Q mark as the only home hero object', () => {
    const home = renderHome();
    expect(home).toContain('id="gateway"');
    expect(home).toContain('data-proof="hero"');
    expect(home).not.toContain('earth-stage');
    expect(home).toContain('data-stage="proof"');
  });

  it('wires technology related chips as stages, not fake tech ids', () => {
    const tech = renderTechnology();
    expect(tech).toContain('data-stage="person"');
    expect(tech).toContain('data-stage-id="riley"');
    expect(tech).toContain('data-stage="programme"');
    expect(renderStory()).toMatch(/j and k/i);
  });
});
