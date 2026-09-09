import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createDeck, dealDeck, takeCardsFromHand } from '../src/cards.js';
import { analyzePlay, canBeat } from '../src/rules.js';

test('牌堆包含 54 张唯一牌，发牌数量正确', () => {
  const deck = createDeck();
  assert.equal(deck.length, 54);
  assert.equal(new Set(deck.map((card) => card.id)).size, 54);

  const dealt = dealDeck(() => 0.5);
  assert.deepEqual(dealt.hands.map((hand) => hand.length), [17, 17, 17]);
  assert.equal(dealt.bottom.length, 3);
});

test('支持中文大小王别名和基础牌型比较', () => {
  const hand = createDeck().filter((card) => ['SJ', 'BJ', '2', '3'].includes(card.rank));
  const rocket = analyzePlay(takeCardsFromHand(hand, '小王 大王'));
  const pair = analyzePlay(takeCardsFromHand(hand, '2 2'));
  assert.equal(rocket?.kind, 'rocket');
  assert.equal(pair?.kind, 'pair');
  assert.equal(canBeat(rocket!, pair), true);
});
