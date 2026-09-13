import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { motionBedFor, plateFor, PLATES } from '../src/data/plates';
import { diagramFigure } from '../src/ui/diagrams';
import { renderPatents } from '../src/ui/pages';
import { renderCity, renderVision } from '../src/ui/views';
import { cityById } from '../src/data/cities';

describe('Topic plates', () => {
  it('maps Vision and essays to real photographs, not leftover SVGs', () => {
    expect(plateFor('vision').src).toBe(PLATES.ucl.src);
    expect(plateFor('philosophy').src).toBe(PLATES.fiber.src);
    expect(plateFor('gbtd').src).toBe(PLATES.canary.src);
    expect(plateFor('standards').src).toBe(PLATES.geneva.src);
    expect(plateFor('essay-future').src).toBe(PLATES.future.src);
    const fig = diagramFigure('essay-philosophy', 'chapter', 'Philosophy');
    expect(fig).toContain('/visuals/topics/fiber.jpg');
    expect(fig).not.toContain('<svg');
  });

  it('keeps instrument SVGs for people, patents, SATP and quotes', () => {
    expect(diagramFigure('verdian', 'person', 'GV')).toContain('<svg');
    expect(diagramFigure('patent-us', 'patent', 'US11842335B2')).toContain('CLAIM SEQUENCE');
    expect(diagramFigure('satp-3', 'satp', '2PC')).toContain('2PC');
    expect(diagramFigure('q1', 'quote', 'Verdian')).toContain('“');
  });

  it('ships the topic JPEGs used on Vision', () => {
    for (const file of ['ucl.jpg', 'fiber.jpg', 'canary.jpg', 'city.jpg', 'library.jpg', 'exchange.jpg', 'datacenter.jpg', 'cable.jpg', 'payments.jpg', 'radio.jpg', 'newsroom.jpg', 'patents-hall.jpg']) {
      expect(existsSync(resolve(process.cwd(), 'public/visuals/topics', file)), file).toBe(true);
    }
  });

  it('maps each city id to that city’s Wikimedia still', () => {
    expect(plateFor('london').src).toBe('/visuals/cities/london.jpg');
    expect(plateFor('geneva').src).toBe('/visuals/cities/geneva.jpg');
    expect(plateFor('basel').src).toBe('/visuals/cities/basel.jpg');
    expect(plateFor('new-york').src).toBe('/visuals/cities/new-york.jpg');
    expect(plateFor('hong-kong').src).toBe('/visuals/cities/hong-kong.jpg');
  });

  it('puts related photographs on the Vision essays', () => {
    const html = renderVision();
    expect(html).toContain('/visuals/topics/ucl.jpg');
    expect(html).toContain('/visuals/topics/fiber.jpg');
    expect(html).toContain('cinema-hero');
    expect(html).toContain('hero-plate');
    expect(html).toContain('hero-still');
    expect(html).toContain('hero-wash');
    expect(html).not.toContain('hero-bed');
  });

  it('keeps unique city stills on city pages and does not cover them with a bed', () => {
    expect(motionBedFor('geneva')).toBeUndefined();
    expect(motionBedFor('hong-kong')).toBeUndefined();
    const geneva = cityById('geneva');
    expect(geneva).toBeTruthy();
    const cityHtml = renderCity(geneva!);
    expect(cityHtml).toContain('/visuals/cities/geneva.jpg');
    expect(cityHtml).not.toContain('hero-bed');
  });

  it('keeps the patent claim SVG and adds a hall photograph above it', () => {
    const html = renderPatents();
    expect(html).toContain('/visuals/topics/patents-hall.jpg');
    expect(html).toContain('CLAIM SEQUENCE');
    expect(html).not.toContain('hero-bed');
  });
});
