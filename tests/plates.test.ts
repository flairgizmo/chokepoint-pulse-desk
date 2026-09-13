import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { plateFor, PLATES } from '../src/data/plates';
import { diagramFigure } from '../src/ui/diagrams';
import { renderVision } from '../src/ui/views';

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
    for (const file of ['ucl.jpg', 'fiber.jpg', 'canary.jpg', 'city.jpg', 'library.jpg', 'exchange.jpg', 'datacenter.jpg', 'cable.jpg', 'payments.jpg']) {
      expect(existsSync(resolve(process.cwd(), 'public/visuals/topics', file)), file).toBe(true);
    }
  });

  it('puts related photographs on the Vision essays', () => {
    const html = renderVision();
    expect(html).toContain('/visuals/topics/ucl.jpg');
    expect(html).toContain('/visuals/topics/fiber.jpg');
    expect(html).toContain('cinema-hero');
    expect(html).toContain('hero-plate');
  });
});
