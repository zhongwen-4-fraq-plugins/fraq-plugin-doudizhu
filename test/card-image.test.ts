import assert from 'node:assert/strict';
import { test } from 'node:test';
import sharp from 'sharp';

import { CardImageRenderer } from '../src/card-image.js';
import { createDeck } from '../src/cards.js';

test('17 张手牌拼接为可发送的 base64 图片', async () => {
  const uri = await new CardImageRenderer().render(createDeck().slice(0, 17));
  assert.match(uri, /^base64:\/\//);
  const metadata = await sharp(Buffer.from(uri.slice('base64://'.length), 'base64')).metadata();
  assert.equal(metadata.width, 936);
  assert.equal(metadata.height, 183);
});
