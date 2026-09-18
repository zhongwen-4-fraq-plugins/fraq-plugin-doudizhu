import { definePlugin, param, seg, type Session } from '@fraqjs/fraq';

import { CardImageRenderer } from './card-image.js';
import { RoomManager, type GameAction, type GameEvent, type Room } from './game.js';

export interface DoudizhuOptions {
  readonly maxRooms?: number;
  readonly turnTimeoutMs?: number;
  readonly imageDirectory?: string;
}

type HandEvent = Extract<GameEvent, { type: 'hand' }>;

function positiveInteger(value: number | undefined, fallback: number): number {
  return Number.isInteger(value) && value! > 0 ? value! : fallback;
}

export default definePlugin({
  name: 'doudizhu',
  apply(ctx, options: DoudizhuOptions = {}) {
    const maxRooms = positiveInteger(options.maxRooms, 2);
    const turnTimeoutMs = positiveInteger(options.turnTimeoutMs, 60_000);
    const renderer = new CardImageRenderer({ imageDirectory: options.imageDirectory });
    const registeredUsers = new Set<number>();
    const managers = new Map<number, RoomManager>();
    const roomSessions = new Map<number, Session>();

    function getManager(groupId: number): RoomManager {
      let manager = managers.get(groupId);
      if (manager) return manager;
      manager = new RoomManager(
        maxRooms,
        { timeoutMs: turnTimeoutMs },
        async (room) => {
          const session = roomSessions.get(room.id);
          roomSessions.delete(room.id);
          if (session) await session.reply('本局因操作超时已结束，房间已释放。');
        },
      );
      managers.set(groupId, manager);
      return manager;
    }

    function groupIdOf(session: Session): number | undefined {
      return session.raw.message_scene === 'group' ? session.raw.peer_id : undefined;
    }

    function requireRoom(session: Session): { manager: RoomManager; room: Room } | undefined {
      const groupId = groupIdOf(session);
      if (groupId === undefined) return undefined;
      const manager = getManager(groupId);
      const room = manager.getByHuman(String(session.raw.sender_id));
      if (!room) {
        void session.reply('你当前没有斗地主房间，请先发送“开始斗地主”。');
        return undefined;
      }
      return { manager, room };
    }

    async function replyEvents(session: Session, events: readonly GameEvent[]): Promise<void> {
      for (const event of events) {
        if (event.type === 'hand') {
          await sendHandPrivately(session, event);
        } else if (event.type === 'played') {
          const image = await renderer.render(event.cards);
          await session.reply([textSegment(event.text), seg.image(image, { summary: '本轮出牌' })]);
        } else {
          await session.reply(event.text);
        }
      }
    }

    async function sendHandPrivately(session: Session, event: HandEvent): Promise<void> {
      const userId = Number(event.playerId);
      if (!Number.isSafeInteger(userId)) return;
      const image = await renderer.render(event.cards);
      try {
        await ctx.client.send_private_message({
          user_id: userId,
          message: [textSegment(event.text), seg.image(image, { summary: event.text })],
        });
      } catch (error) {
        ctx.logger.error('斗地主手牌私聊发送失败', error);
        await session.reply('手牌私聊发送失败，请先加机器人为好友，再发送「开始斗地主」。');
      }
    }

    async function act(session: Session, action: GameAction): Promise<void> {
      const target = requireRoom(session);
      if (!target) return;
      try {
        const events = await target.room.game.act(String(session.raw.sender_id), action);
        await replyEvents(session, events);
        if (target.room.game.phase === 'finished') {
          target.manager.remove(target.room.id);
          roomSessions.delete(target.room.id);
        }
      } catch (error) {
        await session.reply(error instanceof Error ? error.message : '操作失败，请稍后再试。');
      }
    }

    const router = ctx.router.filter((session) => session.raw.message_scene === 'group');

    router.command('注册').describe('注册斗地主玩家').execute(async (session) => {
      registeredUsers.add(session.raw.sender_id);
      await session.reply('斗地主注册成功。发送“开始斗地主”即可开局。');
    });

    router.command('开始斗地主').describe('创建一局斗地主人机对局').execute(async (session) => {
      const userId = session.raw.sender_id;
      if (!registeredUsers.has(userId)) {
        await session.reply('请先发送“注册”完成斗地主注册。');
        return;
      }
      const groupId = groupIdOf(session)!;
      const manager = getManager(groupId);
      try {
        const senderName = session.raw.message_scene === 'group'
          ? session.raw.group_member.card || session.raw.group_member.nickname
          : String(userId);
        const room = manager.create(String(userId), senderName);
        roomSessions.set(room.id, session);
        await replyEvents(session, await room.game.begin());
      } catch (error) {
        await session.reply(error instanceof Error ? error.message : '创建房间失败，请稍后再试。');
      }
    });

    router.command('明牌').describe('在群内公开自己的手牌').execute(async (session) => {
      const target = requireRoom(session);
      if (!target) return;
      const player = target.room.game.snapshot.players.find((item) => item.id === String(session.raw.sender_id));
      if (!player) return;
      const image = await renderer.render(player.hand);
      await session.reply([
        textSegment(`${player.name} 明牌，手牌 ${player.hand.length} 张`),
        seg.image(image, { summary: '斗地主明牌' }),
      ]);
    });

    router.command('叫地主').execute((session) => act(session, { type: 'bid', level: 3 }));
    router
      .command('叫地主')
      .arg('level', param.num().refine((value): value is 0 | 1 | 2 | 3 => value >= 0 && value <= 3 && Number.isInteger(value)))
      .execute((session, { level }) => act(session, { type: 'bid', level }));
    router.command('抢地主').execute((session) => {
      const target = requireRoom(session);
      if (!target) return;
      const nextBid = Math.min(3, target.room.game.snapshot.highestBid + 1) as 1 | 2 | 3;
      return act(session, { type: 'bid', level: nextBid });
    });
    router.command('不叫').execute((session) => act(session, { type: 'bid', level: 0 }));
    router.command('加倍').execute((session) => act(session, { type: 'double', level: 1 }));
    router.command('超级加倍').execute((session) => act(session, { type: 'double', level: 2 }));
    router.command('不加倍').execute((session) => act(session, { type: 'double', level: 0 }));
    router
      .command('出牌')
      .arg('cards', param.greedy())
      .execute((session, { cards }) => act(session, { type: 'play', cards }));
    router.command('要不起').execute((session) => act(session, { type: 'pass' }));
  },
});

function textSegment(text: string): { type: 'text'; data: { text: string } } {
  return { type: 'text', data: { text } };
}

export { RoomManager };
