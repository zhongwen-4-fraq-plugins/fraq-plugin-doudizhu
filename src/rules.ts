import { Card, sortCards } from './cards';

export type PlayKind =
  | 'single'
  | 'pair'
  | 'triple'
  | 'triple-single'
  | 'triple-pair'
  | 'straight'
  | 'pair-straight'
  | 'airplane'
  | 'airplane-single'
  | 'airplane-pair'
  | 'bomb'
  | 'rocket';

export interface Play {
  readonly cards: Card[];
  readonly kind: PlayKind;
  readonly mainValue: number;
  readonly length: number;
}

interface CountGroup {
  value: number;
  cards: Card[];
}

function groups(cards: readonly Card[]): CountGroup[] {
  const map = new Map<number, Card[]>();
  for (const card of cards) {
    const group = map.get(card.value) ?? [];
    group.push(card);
    map.set(card.value, group);
  }
  return [...map.entries()]
    .sort(([left], [right]) => left - right)
    .map(([value, groupedCards]) => ({ value, cards: groupedCards }));
}

function isConsecutive(values: readonly number[], minimumLength: number): boolean {
  return (
    values.length >= minimumLength &&
    values.every((value, index) => index === 0 || (value === values[index - 1]! + 1 && value < 15))
  );
}

function findTripleSequence(grouped: readonly CountGroup[]): number[] | undefined {
  const triples = grouped.filter((group) => group.cards.length >= 3 && group.value < 15).map((group) => group.value);
  if (triples.length < 2 || !isConsecutive(triples, 2)) {
    return undefined;
  }
  return triples;
}

export function analyzePlay(cards: readonly Card[]): Play | undefined {
  if (cards.length === 0) return undefined;
  const sorted = sortCards(cards);
  const grouped = groups(sorted);
  const counts = grouped.map((group) => group.cards.length).sort((left, right) => left - right);
  const values = grouped.map((group) => group.value);

  if (sorted.length === 2 && values[0] === 16 && values[1] === 17) {
    return { cards: sorted, kind: 'rocket', mainValue: 17, length: 1 };
  }
  if (sorted.length === 4 && counts.length === 1) {
    return { cards: sorted, kind: 'bomb', mainValue: grouped[0]!.value, length: 1 };
  }
  if (sorted.length === 1) return { cards: sorted, kind: 'single', mainValue: sorted[0]!.value, length: 1 };
  if (sorted.length === 2 && counts.length === 1) return { cards: sorted, kind: 'pair', mainValue: grouped[0]!.value, length: 1 };
  if (sorted.length === 3 && counts.length === 1) return { cards: sorted, kind: 'triple', mainValue: grouped[0]!.value, length: 1 };
  if (sorted.length === 4 && counts.length === 2 && counts[1] === 3) {
    return { cards: sorted, kind: 'triple-single', mainValue: grouped.find((group) => group.cards.length === 3)!.value, length: 1 };
  }
  if (sorted.length === 5 && counts.length === 2 && counts[0] === 2 && counts[1] === 3) {
    return { cards: sorted, kind: 'triple-pair', mainValue: grouped.find((group) => group.cards.length === 3)!.value, length: 1 };
  }
  if (counts.every((count) => count === 1) && isConsecutive(values, 5)) {
    return { cards: sorted, kind: 'straight', mainValue: values.at(-1)!, length: values.length };
  }
  if (counts.every((count) => count === 2) && isConsecutive(values, 3)) {
    return { cards: sorted, kind: 'pair-straight', mainValue: values.at(-1)!, length: values.length };
  }

  const tripleSequence = findTripleSequence(grouped);
  if (tripleSequence && tripleSequence.length * 3 === sorted.length) {
    return { cards: sorted, kind: 'airplane', mainValue: tripleSequence.at(-1)!, length: tripleSequence.length };
  }
  if (tripleSequence && tripleSequence.length * 4 === sorted.length) {
    const rest = grouped.filter((group) => !tripleSequence.includes(group.value));
    if (rest.every((group) => group.cards.length === 1)) {
      return { cards: sorted, kind: 'airplane-single', mainValue: tripleSequence.at(-1)!, length: tripleSequence.length };
    }
  }
  if (tripleSequence && tripleSequence.length * 5 === sorted.length) {
    const rest = grouped.filter((group) => !tripleSequence.includes(group.value));
    if (rest.every((group) => group.cards.length === 2)) {
      return { cards: sorted, kind: 'airplane-pair', mainValue: tripleSequence.at(-1)!, length: tripleSequence.length };
    }
  }
  return undefined;
}

export function canBeat(candidate: Play, previous: Play | undefined): boolean {
  if (!previous) return true;
  if (candidate.kind === 'rocket') return true;
  if (previous.kind === 'rocket') return false;
  if (candidate.kind === 'bomb') {
    return previous.kind !== 'bomb' || candidate.mainValue > previous.mainValue;
  }
  if (previous.kind === 'bomb') return false;
  return candidate.kind === previous.kind && candidate.length === previous.length && candidate.mainValue > previous.mainValue;
}

function chooseCards(groupsByCount: readonly CountGroup[], count: number, value: number): Card[] {
  return groupsByCount.find((group) => group.value === value)!.cards.slice(0, count);
}

function generateBasicPlays(hand: readonly Card[]): Play[] {
  const grouped = groups(hand);
  const plays: Play[] = [];
  for (const group of grouped) {
    plays.push({ cards: chooseCards(grouped, 1, group.value), kind: 'single', mainValue: group.value, length: 1 });
    if (group.cards.length >= 2) plays.push({ cards: chooseCards(grouped, 2, group.value), kind: 'pair', mainValue: group.value, length: 1 });
    if (group.cards.length >= 3) plays.push({ cards: chooseCards(grouped, 3, group.value), kind: 'triple', mainValue: group.value, length: 1 });
    if (group.cards.length === 4) plays.push({ cards: group.cards, kind: 'bomb', mainValue: group.value, length: 1 });
  }

  const values = grouped.filter((group) => group.value < 15 && group.cards.length >= 1).map((group) => group.value);
  for (let start = 0; start < values.length; start += 1) {
    for (let end = start + 5; end <= values.length; end += 1) {
      const window = values.slice(start, end);
      if (!isConsecutive(window, 5)) break;
      plays.push({ cards: window.flatMap((value) => chooseCards(grouped, 1, value)), kind: 'straight', mainValue: window.at(-1)!, length: window.length });
    }
  }
  const pairValues = grouped.filter((group) => group.value < 15 && group.cards.length >= 2).map((group) => group.value);
  for (let start = 0; start < pairValues.length; start += 1) {
    for (let end = start + 3; end <= pairValues.length; end += 1) {
      const window = pairValues.slice(start, end);
      if (!isConsecutive(window, 3)) break;
      plays.push({ cards: window.flatMap((value) => chooseCards(grouped, 2, value)), kind: 'pair-straight', mainValue: window.at(-1)!, length: window.length });
    }
  }
  if (grouped.some((group) => group.value === 16 && group.cards.length > 0) && grouped.some((group) => group.value === 17 && group.cards.length > 0)) {
    plays.push({ cards: [...chooseCards(grouped, 1, 16), ...chooseCards(grouped, 1, 17)], kind: 'rocket', mainValue: 17, length: 1 });
  }
  return plays;
}

export function findAiPlay(hand: readonly Card[], previous: Play | undefined): Play | undefined {
  const candidates = generateBasicPlays(hand)
    .filter((candidate) => canBeat(candidate, previous))
    .sort((left, right) => left.cards.length - right.cards.length || left.mainValue - right.mainValue);
  if (candidates.length > 0) return candidates[0];
  if (previous) return undefined;
  return candidates[0];
}
