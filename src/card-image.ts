import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import type { Card } from './cards';

const CARD_WIDTH = 120;
const CARD_HEIGHT = Math.round((1044 / 750) * CARD_WIDTH);
const CARD_OVERLAP = 50;

export interface CardImageOptions {
  readonly imageDirectory?: string;
}

export class CardImageRenderer {
  private readonly cache = new Map<string, string>();
  private readonly imageDirectory: string;

  constructor(options: CardImageOptions = {}) {
    this.imageDirectory = path.resolve(
      options.imageDirectory ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../image'),
    );
  }

  async render(cards: readonly Card[]): Promise<string> {
    if (cards.length === 0) {
      throw new Error('不能拼接空牌面。');
    }
    const key = cards.map((card) => card.id).join('|');
    const cached = this.cache.get(key);
    if (cached) return cached;

    const width = CARD_WIDTH + (cards.length - 1) * CARD_OVERLAP + 16;
    const height = CARD_HEIGHT + 16;
    const composites = await Promise.all(
      cards.map(async (card, index) => ({
        input: await sharp(path.join(this.imageDirectory, card.imageName))
          .resize(CARD_WIDTH, CARD_HEIGHT, { fit: 'fill' })
          .png()
          .toBuffer(),
        left: 8 + index * CARD_OVERLAP,
        top: 8,
      })),
    );
    const buffer = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(composites)
      .png()
      .toBuffer();
    const uri = `base64://${buffer.toString('base64')}`;
    this.cache.set(key, uri);
    return uri;
  }
}
