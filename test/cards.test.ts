import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createDeck, dealDeck, sortCardsDescending, takeCardsFromHand } from '../src/cards.js';
import { analyzePlay, canBeat, findAiPlay } from '../src/rules.js';

function playInput(input: string) {
  return takeCardsFromHand(createDeck(), input);
}

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

test('展示手牌按牌面从高到低排列', () => {
  const cards = createDeck().filter((card) => ['Club-3', 'Diamond-A', 'Heart-2', 'Joker-SJ', 'Joker-BJ'].includes(card.id));
  assert.deepEqual(
    sortCardsDescending(cards).map((card) => card.rank),
    ['BJ', 'SJ', '2', 'A', '3'],
  );
});

test('顺子和连对使用经典点数边界', () => {
  assert.equal(analyzePlay(playInput('10 J Q K A'))?.kind, 'straight');
  assert.equal(analyzePlay(playInput('3 4 5 6 7'))?.kind, 'straight');
  assert.equal(analyzePlay(playInput('10 J Q K A 2')) , undefined);
  assert.equal(analyzePlay(playInput('3 3 4 4 5 5'))?.kind, 'pair-straight');
  assert.equal(analyzePlay(playInput('4 4 5 5')) , undefined);
  assert.equal(analyzePlay(playInput('J J Q Q K K A A'))?.kind, 'pair-straight');
});

test('飞机机身连续且带牌数量匹配', () => {
  assert.equal(analyzePlay(playInput('3 3 3 4 4 4'))?.kind, 'airplane');
  assert.equal(analyzePlay(playInput('3 3 3 4 4 4 7 8'))?.kind, 'airplane-single');
  assert.equal(analyzePlay(playInput('3 3 3 4 4 4 7 7'))?.kind, 'airplane-single');
  assert.equal(analyzePlay(playInput('3 3 3 4 4 4 7 7 8 8'))?.kind, 'airplane-pair');
  assert.equal(analyzePlay(playInput('3 3 3 5 5 5 7 8')) , undefined);
  assert.equal(analyzePlay(playInput('3 3 3 4 4 4 7')) , undefined);
});

test('支持四带两张单牌和四带两对', () => {
  assert.equal(analyzePlay(playInput('3 3 3 3 5 7'))?.kind, 'four-single');
  assert.equal(analyzePlay(playInput('4 4 4 4 6 6 8 8'))?.kind, 'four-pair');
  const fourSingle = analyzePlay(playInput('3 3 3 3 5 7'))!;
  const higherFourSingle = analyzePlay(playInput('4 4 4 4 5 7'))!;
  const fourPair = analyzePlay(playInput('4 4 4 4 6 6 8 8'))!;
  assert.equal(canBeat(higherFourSingle, fourSingle), true);
  assert.equal(canBeat(fourPair, fourSingle), false);
});

test('同花色实体牌不能在一手出牌中重复使用', () => {
  const card = createDeck()[0]!;
  assert.equal(analyzePlay([card, card]), undefined);
});

test('机器人可以跟出三带、飞机和四带牌型', () => {
  const tripleSingleHand = playInput('4 4 4 6');
  const tripleSingle = analyzePlay(playInput('3 3 3 5'))!;
  assert.equal(findAiPlay(tripleSingleHand, tripleSingle)?.kind, 'triple-single');

  const airplaneHand = playInput('4 4 4 5 5 5');
  const airplane = analyzePlay(playInput('3 3 3 4 4 4'))!;
  assert.equal(findAiPlay(airplaneHand, airplane)?.kind, 'airplane');

  const fourHand = playInput('4 4 4 4 5 6');
  const four = analyzePlay(playInput('3 3 3 3 7 8'))!;
  const fourCandidate = analyzePlay(fourHand)!;
  assert.equal(fourCandidate.kind, 'four-single');
  assert.equal(canBeat(fourCandidate, four), true);
  assert.equal(findAiPlay(fourHand, four)?.kind, 'bomb', '机器人可以选择用更小的炸弹压制四带二');
});
