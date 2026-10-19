import { groupCards, isConsecutive, type CardGroup } from './card-groups';
import { sortCards, type Card } from './cards';

export type PlayKind =
  | 'single' | 'pair' | 'triple' | 'triple-single' | 'triple-pair'
  | 'straight' | 'pair-straight' | 'airplane' | 'airplane-single' | 'airplane-pair'
  | 'four-single' | 'four-pair' | 'bomb' | 'rocket';

export interface Play {
  readonly cards: Card[];
  readonly kind: PlayKind;
  readonly mainValue: number;
  readonly length: number;
}

function choose(grouped: readonly CardGroup[], value: number, count: number): Card[] {
  return grouped.find((group) => group.value === value)!.cards.slice(0, count);
}

function findAirplanes(cards: Card[], grouped: readonly CardGroup[], kind: 'airplane' | 'airplane-single' | 'airplane-pair'): Play[] {
  const cardsPerBody = kind === 'airplane' ? 3 : kind === 'airplane-single' ? 4 : 5;
  const length = cards.length / cardsPerBody;
  if (!Number.isInteger(length) || length < 2) return [];
  const bodies = grouped.filter((group) => group.value < 15 && group.cards.length >= 3);
  const plays: Play[] = [];
  for (let start = 0; start + length <= bodies.length; start += 1) {
    const body = bodies.slice(start, start + length);
    if (!isConsecutive(body.map((group) => group.value), 2)) continue;
    const bodyValues = new Set(body.map((group) => group.value));
    const bodyCards = body.flatMap((group) => group.cards.slice(0, 3));
    const remaining = cards.filter((card) => !bodyCards.some((bodyCard) => bodyCard.id === card.id));
    if (kind === 'airplane' && remaining.length === 0) plays.push({ cards, kind, mainValue: body.at(-1)!.value, length });
    if (remaining.some((card) => bodyValues.has(card.value))) continue;
    const remainingGroups = groupCards(remaining);
    if (kind === 'airplane-single' && remaining.length === length) plays.push({ cards, kind, mainValue: body.at(-1)!.value, length });
    if (kind === 'airplane-pair' && remaining.length === length * 2 && remainingGroups.every((group) => group.cards.length === 2)) plays.push({ cards, kind, mainValue: body.at(-1)!.value, length });
  }
  return plays;
}

export function analyzePlay(cards: readonly Card[], previous?: Play): Play | undefined {
  if (cards.length === 0 || cards.length > 20 || new Set(cards.map((card) => card.id)).size !== cards.length) return undefined;
  const sorted = sortCards(cards);
  const grouped = groupCards(sorted);
  const counts = grouped.map((group) => group.cards.length).sort((left, right) => left - right);
  const values = grouped.map((group) => group.value);
  if (sorted.length === 2 && values[0] === 16 && values[1] === 17) return { cards: sorted, kind: 'rocket', mainValue: 17, length: 1 };
  if (sorted.length === 4 && counts.length === 1) return { cards: sorted, kind: 'bomb', mainValue: grouped[0]!.value, length: 1 };
  if (sorted.length === 1) return { cards: sorted, kind: 'single', mainValue: sorted[0]!.value, length: 1 };
  if (sorted.length === 2 && counts.length === 1) return { cards: sorted, kind: 'pair', mainValue: grouped[0]!.value, length: 1 };
  if (sorted.length === 3 && counts.length === 1) return { cards: sorted, kind: 'triple', mainValue: grouped[0]!.value, length: 1 };
  if (sorted.length === 4 && counts.length === 2 && counts[1] === 3) return { cards: sorted, kind: 'triple-single', mainValue: grouped.find((group) => group.cards.length === 3)!.value, length: 1 };
  if (sorted.length === 5 && counts.length === 2 && counts[0] === 2 && counts[1] === 3) return { cards: sorted, kind: 'triple-pair', mainValue: grouped.find((group) => group.cards.length === 3)!.value, length: 1 };
  if (counts.every((count) => count === 1) && isConsecutive(values, 5)) return { cards: sorted, kind: 'straight', mainValue: values.at(-1)!, length: values.length };
  if (counts.every((count) => count === 2) && isConsecutive(values, 3)) return { cards: sorted, kind: 'pair-straight', mainValue: values.at(-1)!, length: values.length };
  const four = grouped.find((group) => group.cards.length === 4);
  if (four && sorted.length === 6) return { cards: sorted, kind: 'four-single', mainValue: four.value, length: 1 };
  if (four && sorted.length === 8 && grouped.filter((group) => group.value !== four.value).every((group) => group.cards.length === 2)) return { cards: sorted, kind: 'four-pair', mainValue: four.value, length: 1 };
  for (const kind of ['airplane', 'airplane-single', 'airplane-pair'] as const) {
    const play = findAirplanes(sorted, grouped, kind).find((candidate) => candidate.kind === previous?.kind && candidate.length === previous.length);
    if (play) return play;
  }
  for (const kind of ['airplane', 'airplane-single', 'airplane-pair'] as const) {
    const play = findAirplanes(sorted, grouped, kind)[0];
    if (play) return play;
  }
  return undefined;
}

export function canBeat(candidate: Play, previous: Play | undefined): boolean {
  if (!previous) return true;
  if (previous.kind === 'rocket') return false;
  if (candidate.kind === 'rocket') return true;
  if (candidate.kind === 'bomb') return previous.kind !== 'bomb' || candidate.mainValue > previous.mainValue;
  if (previous.kind === 'bomb') return false;
  return candidate.kind === previous.kind && candidate.length === previous.length && candidate.mainValue > previous.mainValue;
}

function generateBasicPlays(hand: readonly Card[]): Play[] {
  const grouped = groupCards(sortCards(hand));
  const plays: Play[] = [];
  for (const group of grouped) {
    plays.push({ cards: choose(grouped, group.value, 1), kind: 'single', mainValue: group.value, length: 1 });
    if (group.cards.length >= 2) plays.push({ cards: choose(grouped, group.value, 2), kind: 'pair', mainValue: group.value, length: 1 });
    if (group.cards.length >= 3) {
      const triple = choose(grouped, group.value, 3);
      plays.push({ cards: triple, kind: 'triple', mainValue: group.value, length: 1 });
      const single = grouped.find((other) => other.value !== group.value && other.cards.length > 0)?.cards[0];
      if (single) plays.push({ cards: [...triple, single], kind: 'triple-single', mainValue: group.value, length: 1 });
      const pair = grouped.find((other) => other.value !== group.value && other.cards.length >= 2)?.cards.slice(0, 2);
      if (pair) plays.push({ cards: [...triple, ...pair], kind: 'triple-pair', mainValue: group.value, length: 1 });
    }
    if (group.cards.length === 4) {
      plays.push({ cards: group.cards, kind: 'bomb', mainValue: group.value, length: 1 });
      const otherCards = grouped.filter((other) => other.value !== group.value).flatMap((other) => other.cards);
      if (otherCards.length >= 2) plays.push({ cards: [...group.cards, ...otherCards.slice(0, 2)], kind: 'four-single', mainValue: group.value, length: 1 });
      const otherPairs = grouped.filter((other) => other.value !== group.value && other.cards.length >= 2);
      if (otherPairs.length >= 2) plays.push({ cards: [...group.cards, ...otherPairs[0]!.cards.slice(0, 2), ...otherPairs[1]!.cards.slice(0, 2)], kind: 'four-pair', mainValue: group.value, length: 1 });
    }
  }
  const values = grouped.filter((group) => group.value < 15 && group.cards.length >= 1).map((group) => group.value);
  for (let start = 0; start < values.length; start += 1) for (let end = start + 5; end <= values.length; end += 1) {
    const window = values.slice(start, end); if (!isConsecutive(window, 5)) break;
    plays.push({ cards: window.flatMap((value) => choose(grouped, value, 1)), kind: 'straight', mainValue: window.at(-1)!, length: window.length });
  }
  const pairValues = grouped.filter((group) => group.value < 15 && group.cards.length >= 2).map((group) => group.value);
  for (let start = 0; start < pairValues.length; start += 1) for (let end = start + 3; end <= pairValues.length; end += 1) {
    const window = pairValues.slice(start, end); if (!isConsecutive(window, 3)) break;
    plays.push({ cards: window.flatMap((value) => choose(grouped, value, 2)), kind: 'pair-straight', mainValue: window.at(-1)!, length: window.length });
  }
  const tripleValues = grouped.filter((group) => group.value < 15 && group.cards.length >= 3).map((group) => group.value);
  for (let start = 0; start < tripleValues.length; start += 1) for (let end = start + 2; end <= tripleValues.length; end += 1) {
    const window = tripleValues.slice(start, end);
    if (!isConsecutive(window, 2)) break;
    const body = window.flatMap((value) => choose(grouped, value, 3));
    plays.push({ cards: body, kind: 'airplane', mainValue: window.at(-1)!, length: window.length });
    const attachments = grouped.filter((group) => !window.includes(group.value));
    const singleWings = attachments.flatMap((group) => group.cards);
    if (singleWings.length >= window.length) plays.push({ cards: [...body, ...singleWings.slice(0, window.length)], kind: 'airplane-single', mainValue: window.at(-1)!, length: window.length });
    const pairWings = attachments.filter((group) => group.cards.length >= 2);
    if (pairWings.length >= window.length) plays.push({ cards: [...body, ...pairWings.slice(0, window.length).flatMap((group) => group.cards.slice(0, 2))], kind: 'airplane-pair', mainValue: window.at(-1)!, length: window.length });
  }
  if (grouped.some((group) => group.value === 16) && grouped.some((group) => group.value === 17)) plays.push({ cards: [...choose(grouped, 16, 1), ...choose(grouped, 17, 1)], kind: 'rocket', mainValue: 17, length: 1 });
  return plays;
}

export function findAiPlay(hand: readonly Card[], previous: Play | undefined): Play | undefined {
  return generateBasicPlays(hand).filter((candidate) => canBeat(candidate, previous)).sort((left, right) => left.cards.length - right.cards.length || left.mainValue - right.mainValue)[0];
}
