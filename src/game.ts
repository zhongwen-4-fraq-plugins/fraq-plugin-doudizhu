import { Card, dealDeck, sortCards, takeCardsFromHand } from './cards';
import { analyzePlay, canBeat, findAiPlay, Play } from './rules';

export type GamePhase = 'bidding' | 'doubling' | 'playing' | 'finished';
export type PlayerKind = 'human' | 'bot';

export interface Player {
  readonly id: string;
  readonly kind: PlayerKind;
  readonly name: string;
  hand: Card[];
  bid: number;
  bidChoice?: 0 | 1 | 2 | 3;
  multiplier: number;
  doubleChoice?: 0 | 1 | 2;
}

export interface GameSnapshot {
  readonly phase: GamePhase;
  readonly currentPlayer: number;
  readonly landlordIndex?: number;
  readonly highestBid: number;
  readonly multiplier: number;
  readonly players: readonly Player[];
  readonly bottom: readonly Card[];
  readonly previousPlay?: Play;
  readonly lastPlayer?: number;
}

export type GameAction =
  | { type: 'bid'; level: 0 | 1 | 2 | 3 }
  | { type: 'double'; level: 0 | 1 | 2 }
  | { type: 'play'; cards: string }
  | { type: 'pass' };

export type GameEvent =
  | { type: 'message'; text: string }
  | { type: 'hand'; playerId: string; cards: Card[]; text: string }
  | { type: 'played'; playerId: string; cards: Card[]; text: string }
  | { type: 'turn'; playerId: string; text: string }
  | { type: 'finished'; winnerId: string; text: string }
  | { type: 'expired'; text: string };

export interface GameOptions {
  readonly timeoutMs: number;
  readonly random?: () => number;
  readonly onExpired?: () => void | Promise<void>;
}

const BOT_NAMES = ['机器人甲', '机器人乙'];

function nextPlayer(index: number): number {
  return (index + 1) % 3;
}

function playerLabel(player: Player): string {
  return player.kind === 'human' ? '你' : player.name;
}

function bidLabel(level: number): string {
  return level === 0 ? '不叫' : `${level}分`;
}

function doubleLabel(level: number): string {
  return level === 0 ? '不加倍' : level === 1 ? '加倍' : '超级加倍';
}

function botBid(player: Player): 0 | 1 | 2 | 3 {
  const highCards = player.hand.filter((card) => card.value >= 14).length;
  if (highCards >= 4) return 3;
  if (highCards >= 2) return 2;
  if (highCards >= 1) return 1;
  return 0;
}

function botDouble(player: Player): 0 | 1 | 2 {
  const highCards = player.hand.filter((card) => card.value >= 14).length;
  if (highCards >= 4) return 2;
  if (highCards >= 2) return 1;
  return 0;
}

export class DoudizhuGame {
  readonly players: [Player, Player, Player];
  readonly bottom: Card[];
  phase: GamePhase = 'bidding';
  currentPlayer = 0;
  landlordIndex?: number;
  highestBid = 0;
  multiplier = 1;
  previousPlay?: Play;
  lastPlayer?: number;
  private passCount = 0;
  private bidRound = 1;
  private timeoutHandle?: ReturnType<typeof setTimeout>;
  private readonly options: GameOptions;

  constructor(humanId: string, humanName: string, options: GameOptions) {
    this.options = options;
    const dealt = dealDeck(options.random);
    this.bottom = dealt.bottom;
    this.players = [
      { id: humanId, kind: 'human', name: humanName || humanId, hand: dealt.hands[0], bid: 0, multiplier: 1 },
      { id: 'bot-1', kind: 'bot', name: BOT_NAMES[0], hand: dealt.hands[1], bid: 0, multiplier: 1 },
      { id: 'bot-2', kind: 'bot', name: BOT_NAMES[1], hand: dealt.hands[2], bid: 0, multiplier: 1 },
    ];
    this.resetTimeout();
  }

  get snapshot(): GameSnapshot {
    return {
      phase: this.phase,
      currentPlayer: this.currentPlayer,
      landlordIndex: this.landlordIndex,
      highestBid: this.highestBid,
      multiplier: this.multiplier,
      players: this.players,
      bottom: this.bottom,
      previousPlay: this.previousPlay,
      lastPlayer: this.lastPlayer,
    };
  }

  dispose(): void {
    if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
    this.timeoutHandle = undefined;
    this.phase = 'finished';
  }

  async begin(): Promise<GameEvent[]> {
    const events: GameEvent[] = [
      { type: 'message', text: '斗地主房间已开始，手牌已通过私聊发送。发送「明牌」可向全群公开手牌。' },
      { type: 'hand', playerId: this.players[0].id, cards: this.players[0].hand, text: '你的手牌' },
    ];
    return this.advanceBots(events);
  }

  async act(playerId: string, action: GameAction): Promise<GameEvent[]> {
    if (this.phase === 'finished') return [{ type: 'message', text: '这局已经结束。' }];
    const playerIndex = this.players.findIndex((player) => player.id === playerId);
    if (playerIndex !== this.currentPlayer) {
      return [{ type: 'message', text: `现在轮到${playerLabel(this.players[this.currentPlayer])}操作。` }];
    }
    if (this.players[playerIndex]?.kind !== 'human') {
      return [{ type: 'message', text: '人机正在操作，请稍候。' }];
    }

    const events: GameEvent[] = [];
    if (this.phase === 'bidding' && action.type === 'bid') {
      this.applyBid(playerIndex, action.level, events);
    } else if (this.phase === 'doubling' && action.type === 'double') {
      this.applyDouble(playerIndex, action.level, events);
    } else if (this.phase === 'playing' && action.type === 'pass') {
      this.applyPass(playerIndex, events);
    } else if (this.phase === 'playing' && action.type === 'play') {
      this.applyPlay(playerIndex, action.cards, events);
    } else {
      return [{ type: 'message', text: '当前阶段不能使用这个指令。' }];
    }
    this.resetTimeout();
    return this.advanceBots(events);
  }

  private applyBid(playerIndex: number, level: 0 | 1 | 2 | 3, events: GameEvent[]): void {
    if (level !== 0 && level <= this.highestBid) {
      throw new Error(`叫地主的分数必须高于当前最高分 ${this.highestBid}。`);
    }
    const player = this.players[playerIndex]!;
    player.bid = level;
    player.bidChoice = level;
    this.highestBid = Math.max(this.highestBid, level);
    events.push({ type: 'message', text: `${playerLabel(player)}${bidLabel(level)}。` });
    if (level === 3) {
      this.landlordIndex = playerIndex;
      this.finishBidding(events);
      return;
    }
    if (this.players.every((item) => item.bidChoice !== undefined)) {
      const bidder = this.players.reduce((best, item, index) => (item.bid > this.players[best]!.bid ? index : best), 0);
      if (this.highestBid === 0) {
        this.bidRound += 1;
        this.highestBid = 0;
        this.players.forEach((item) => {
          item.bid = 0;
          item.bidChoice = undefined;
        });
        if (this.bidRound > 3) {
          const random = this.options.random ?? Math.random;
          this.landlordIndex = Math.floor(random() * this.players.length);
          events.push({ type: 'message', text: '连续三轮无人叫地主，系统已随机选择地主。' });
          this.finishBidding(events);
          return;
        }
        this.currentPlayer = 0;
        events.push({ type: 'message', text: `第 ${this.bidRound} 轮叫地主开始。` });
        return;
      }
      this.landlordIndex = bidder;
      this.finishBidding(events);
      return;
    }
    this.currentPlayer = nextPlayer(playerIndex);
  }

  private finishBidding(events: GameEvent[]): void {
    const landlord = this.players[this.landlordIndex!]!;
    landlord.hand = sortCards([...landlord.hand, ...this.bottom]);
    this.phase = 'doubling';
    this.currentPlayer = 0;
    events.push({ type: 'message', text: `${playerLabel(landlord)}成为地主，底牌已加入手牌。请依次选择加倍方式。` });
    events.push({ type: 'hand', playerId: this.players[0].id, cards: this.players[0].hand, text: '你的地主手牌' });
  }

  private applyDouble(playerIndex: number, level: 0 | 1 | 2, events: GameEvent[]): void {
    const player = this.players[playerIndex]!;
    player.doubleChoice = level;
    player.multiplier = level === 0 ? 1 : level === 1 ? 2 : 4;
    this.multiplier *= level === 0 ? 1 : level === 1 ? 2 : 4;
    events.push({ type: 'message', text: `${playerLabel(player)}${doubleLabel(level)}。` });
    if (this.players.every((item) => item.doubleChoice !== undefined)) {
      this.phase = 'playing';
      this.currentPlayer = this.landlordIndex!;
      this.previousPlay = undefined;
      this.lastPlayer = undefined;
      this.passCount = 0;
      events.push({ type: 'message', text: `加倍阶段结束，${playerLabel(this.players[this.currentPlayer])}先出牌。` });
      events.push({ type: 'turn', playerId: this.players[this.currentPlayer].id, text: '轮到你出牌。' });
      return;
    }
    this.currentPlayer = nextPlayer(playerIndex);
  }

  private applyPass(playerIndex: number, events: GameEvent[]): void {
    if (!this.previousPlay) throw new Error('当前没有可不要的牌，请先出牌。');
    const player = this.players[playerIndex]!;
    this.passCount += 1;
    events.push({ type: 'message', text: `${playerLabel(player)}要不起。` });
    if (this.passCount >= 2) {
      this.currentPlayer = this.lastPlayer!;
      this.previousPlay = undefined;
      this.passCount = 0;
      events.push({ type: 'message', text: `两家都不要，${playerLabel(this.players[this.currentPlayer])}重新取得出牌权。` });
      return;
    }
    this.currentPlayer = nextPlayer(playerIndex);
  }

  private applyPlay(playerIndex: number, input: string, events: GameEvent[]): void {
    const player = this.players[playerIndex]!;
    const cards = takeCardsFromHand(player.hand, input);
    const play = analyzePlay(cards);
    if (!play) throw new Error('这组牌不符合斗地主牌型。');
    if (!canBeat(play, this.previousPlay)) throw new Error('这组牌压不过上一手牌。');
    const playedIds = new Set(cards.map((card) => card.id));
    player.hand = player.hand.filter((card) => !playedIds.has(card.id));
    this.previousPlay = play;
    this.lastPlayer = playerIndex;
    this.passCount = 0;
    events.push({ type: 'played', playerId: player.id, cards: play.cards, text: `${playerLabel(player)}出了 ${play.cards.length} 张牌。` });
    if (player.hand.length === 0) {
      this.phase = 'finished';
      this.clearTimeout();
      events.push({ type: 'finished', winnerId: player.id, text: `${playerLabel(player)}获胜！本局倍率 ${this.multiplier}。` });
      return;
    }
    this.currentPlayer = nextPlayer(playerIndex);
  }

  private async advanceBots(events: GameEvent[]): Promise<GameEvent[]> {
    while (this.phase !== 'finished' && this.players[this.currentPlayer]!.kind === 'bot') {
      const playerIndex = this.currentPlayer;
      const player = this.players[playerIndex]!;
      if (this.phase === 'bidding') {
        const bid = botBid(player);
        this.applyBid(playerIndex, bid !== 0 && bid <= this.highestBid ? 0 : bid, events);
      } else if (this.phase === 'doubling') {
        this.applyDouble(playerIndex, botDouble(player), events);
      } else if (this.phase === 'playing') {
        const play = findAiPlay(player.hand, this.previousPlay);
        if (play) {
          this.applyPlay(playerIndex, play.cards.map((card) => card.label).join(' '), events);
        } else {
          this.applyPass(playerIndex, events);
        }
      }
      this.resetTimeout();
    }
    if (this.phase !== 'finished') {
      events.push({ type: 'turn', playerId: this.players[this.currentPlayer]!.id, text: `轮到${playerLabel(this.players[this.currentPlayer])}操作。` });
    }
    return events;
  }

  private resetTimeout(): void {
    this.clearTimeout();
    if (this.phase === 'finished') return;
    this.timeoutHandle = setTimeout(() => {
      if (this.phase === 'finished') return;
      this.phase = 'finished';
      void this.options.onExpired?.();
    }, this.options.timeoutMs);
  }

  private clearTimeout(): void {
    if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
    this.timeoutHandle = undefined;
  }
}

export interface Room {
  readonly id: number;
  readonly humanId: string;
  readonly game: DoudizhuGame;
}

export class RoomManager {
  private readonly rooms = new Map<number, Room>();
  private nextId = 1;

  constructor(
    private readonly maxRooms: number,
    private readonly gameOptions: GameOptions,
    private readonly onExpired?: (room: Room) => void | Promise<void>,
  ) {}

  create(humanId: string, humanName: string): Room {
    if ([...this.rooms.values()].some((room) => room.humanId === humanId)) {
      throw new Error('你已经在这个群的斗地主房间中。');
    }
    if (this.rooms.size >= this.maxRooms) throw new Error(`当前群的 ${this.maxRooms} 个房间都在进行中。`);
    const roomId = this.nextId++;
    let room: Room;
    const game = new DoudizhuGame(humanId, humanName, {
      ...this.gameOptions,
      onExpired: async () => {
        this.remove(roomId);
        await this.onExpired?.(room);
      },
    });
    room = { id: roomId, humanId, game };
    this.rooms.set(room.id, room);
    return room;
  }

  getByHuman(humanId: string): Room | undefined {
    return [...this.rooms.values()].find((room) => room.humanId === humanId);
  }

  get(roomId: number): Room | undefined {
    return this.rooms.get(roomId);
  }

  remove(roomId: number): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.game.dispose();
    this.rooms.delete(roomId);
  }

  list(): readonly Room[] {
    return [...this.rooms.values()];
  }
}
