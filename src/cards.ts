export type Suit = 'Club' | 'Diamond' | 'Heart' | 'Spade' | 'Joker';
export type Rank = '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | '2' | 'SJ' | 'BJ';

export interface Card {
  readonly id: string;
  readonly suit: Suit;
  readonly rank: Rank;
  readonly value: number;
  readonly label: string;
  readonly imageName: string;
}

const SUITS: readonly Exclude<Suit, 'Joker'>[] = ['Club', 'Diamond', 'Heart', 'Spade'];
const RANKS: readonly Rank[] = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
const RANK_VALUES: Record<Rank, number> = {
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
  '2': 15,
  SJ: 16,
  BJ: 17,
};

export function createDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        value: RANK_VALUES[rank],
        label: rank,
        imageName: `${suit}${rank}.png`,
      });
    }
  }
  cards.push(
    { id: 'Joker-SJ', suit: 'Joker', rank: 'SJ', value: RANK_VALUES.SJ, label: '小王', imageName: 'JOKER-A.png' },
    { id: 'Joker-BJ', suit: 'Joker', rank: 'BJ', value: RANK_VALUES.BJ, label: '大王', imageName: 'JOKER-B.png' },
  );
  return cards;
}

export function sortCards(cards: readonly Card[]): Card[] {
  return [...cards].sort((left, right) => left.value - right.value || left.id.localeCompare(right.id));
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function dealDeck(random: () => number = Math.random): {
  hands: [Card[], Card[], Card[]];
  bottom: Card[];
} {
  const deck = shuffle(createDeck(), random);
  return {
    hands: [sortCards(deck.slice(0, 17)), sortCards(deck.slice(17, 34)), sortCards(deck.slice(34, 51))],
    bottom: sortCards(deck.slice(51)),
  };
}

const TOKEN_ALIASES: Record<string, Rank> = {
  '小王': 'SJ',
  SJ: 'SJ',
  '大王': 'BJ',
  BJ: 'BJ',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  J: 'J',
  j: 'J',
  Q: 'Q',
  q: 'Q',
  K: 'K',
  k: 'K',
  A: 'A',
  a: 'A',
  2: '2',
};

export function tokenizeCards(input: string): string[] {
  return input
    .replace(/[，,、]+/g, ' ')
    .trim()
    .split(/\s+/u)
    .filter(Boolean);
}

export function takeCardsFromHand(hand: readonly Card[], input: string): Card[] {
  const selected: Card[] = [];
  const remaining = [...hand];
  for (const token of tokenizeCards(input)) {
    const rank = TOKEN_ALIASES[token];
    if (!rank) {
      throw new Error(`无法识别牌面「${token}」，请使用 3-10、J、Q、K、A、2、小王或大王。`);
    }
    const index = remaining.findIndex((card) => card.rank === rank);
    if (index === -1) {
      throw new Error(`你的手牌中没有可出的「${token}」。`);
    }
    const [card] = remaining.splice(index, 1);
    selected.push(card);
  }
  if (selected.length === 0) {
    throw new Error('请在「出牌」后填写至少一张牌。');
  }
  return selected;
}

export function rankLabel(rank: Rank): string {
  return rank === 'SJ' ? '小王' : rank === 'BJ' ? '大王' : rank;
}
