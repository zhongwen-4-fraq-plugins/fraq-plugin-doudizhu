import type { Card } from './cards';

export interface CardGroup {
  readonly value: number;
  readonly cards: Card[];
}

export function groupCards(cards: readonly Card[]): CardGroup[] {
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

export function isConsecutive(values: readonly number[], minimumLength: number): boolean {
  return values.length >= minimumLength && values.every(
    (value, index) => value < 15 && (index === 0 || value === values[index - 1]! + 1),
  );
}
