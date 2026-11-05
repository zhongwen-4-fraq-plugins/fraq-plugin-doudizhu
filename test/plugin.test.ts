import KyselyPlugin from '@fraqjs/plugin-kysely';
import { createMockContext, inmsg } from '@fraqjs/plugin-mock';

import DoudizhuPlugin from '../src/index.js';

import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

const GROUP_ID = 60001;
const USER_ID = 80001;

interface SentMessage {
  user_id?: number;
  group_id?: number;
  message: { type: string; data?: { text?: string; user_id?: number } }[];
}

interface ApiCall {
  endpoint: string;
  params?: unknown;
}

function sentMessages(calls: readonly ApiCall[], endpoint: string): SentMessage[] {
  return calls.filter((call) => call.endpoint === endpoint).map((call) => call.params as SentMessage);
}

function imageCount(messages: readonly SentMessage[]): number {
  return messages.flatMap((item) => item.message).filter((segment) => segment.type === 'image').length;
}

function textOf(messages: readonly SentMessage[]): string {
  return messages
    .flatMap((item) => item.message)
    .map((segment) => segment.data?.text ?? '')
    .join('\n');
}

async function waitFor(condition: () => boolean, timeoutMs = 3_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!condition()) {
    if (Date.now() > deadline) throw new Error('等待斗地主插件响应超时');
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

async function withDatabaseContext(
  databasePath: string,
  run: (ctx: ReturnType<typeof createMockContext>) => Promise<void>,
  turnTimeoutMs = 1_000,
): Promise<void> {
  const ctx = createMockContext();
  ctx.install(KyselyPlugin, { sqliteUrl: databasePath, autoVacuum: { enabled: false } });
  ctx.install(DoudizhuPlugin, { turnTimeoutMs });
  await ctx.start();
  try {
    await run(ctx);
  } finally {
    await ctx.stop();
  }
}

test('注册信息写入 Kysely 数据库并在重启后保留', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'fraq-doudizhu-'));
  const databasePath = join(directory, 'players.sqlite');
  try {
    await withDatabaseContext(databasePath, async (ctx) => {
      const calls = ctx.mock.apiCalls;
      const send = (text: string) => ctx.mock.receiveGroup({ groupId: GROUP_ID, userId: USER_ID }, inmsg`${text}`);

      await send('开始斗地主');
      await waitFor(() => sentMessages(calls, 'send_group_message').length === 1);
      assert.match(textOf(sentMessages(calls, 'send_group_message')), /请先发送“注册”/);

      await send('注册');
      await waitFor(() => sentMessages(calls, 'send_group_message').length === 2);
      assert.match(textOf(sentMessages(calls, 'send_group_message')), /注册成功/);

      await send('注册');
      await waitFor(() => sentMessages(calls, 'send_group_message').length === 3);
      assert.match(textOf(sentMessages(calls, 'send_group_message')), /已经注册过/);

      calls.length = 0;
      await send('开始斗地主');
      await waitFor(
        () => sentMessages(calls, 'send_private_message').length > 0 && textOf(sentMessages(calls, 'send_group_message')).includes('开始叫地主环节'),
      );

      const hands = sentMessages(calls, 'send_private_message');
      const groupMessages = sentMessages(calls, 'send_group_message');
      assert.equal(hands.length, 1);
      assert.equal(hands[0]?.user_id, USER_ID);
      assert.equal(imageCount(hands), 1);
      assert.match(textOf(hands), /手牌/);
      assert.equal(imageCount(sentMessages(calls, 'send_group_message')), 0, '手牌图片不能发到群里');
      assert.equal(calls.findIndex((call) => call.endpoint === 'send_private_message') < calls.findIndex((call) => call.endpoint === 'send_group_message'), true);
      assert.equal(groupMessages[0]?.message[0]?.data?.text, '对局开始，手牌已发送，发送 [明牌] 可公开手牌\n开始叫地主环节，');
      assert.deepEqual(
        groupMessages[0]?.message.find((segment) => segment.type === 'mention')?.data,
        { user_id: USER_ID },
      );
      assert.equal(groupMessages[0]?.message[2]?.data?.text, ' 你可以发送 [叫地主/不叫] 进行操作');
      assert.doesNotMatch(textOf(groupMessages), /轮到你操作/);

      calls.length = 0;
      await send('明牌');
      await waitFor(() => imageCount(sentMessages(calls, 'send_group_message')) === 1);
      assert.equal(sentMessages(calls, 'send_private_message').length, 0);
      assert.match(textOf(sentMessages(calls, 'send_group_message')), /明牌/);

      await waitFor(() => textOf(sentMessages(calls, 'send_group_message')).includes('超时'));
    });

    await withDatabaseContext(databasePath, async (ctx) => {
      const calls = ctx.mock.apiCalls;
      await ctx.mock.receiveGroup({ groupId: GROUP_ID + 1, userId: USER_ID }, inmsg`开始斗地主`);
      await waitFor(() => sentMessages(calls, 'send_private_message').length > 0);
      assert.equal(sentMessages(calls, 'send_private_message')[0]?.user_id, USER_ID);
      assert.doesNotMatch(textOf(sentMessages(calls, 'send_group_message')), /请先发送“注册”/);
      await waitFor(() => textOf(sentMessages(calls, 'send_group_message')).includes('超时'));
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('结束游戏会释放房间，玩家可以重新开局', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'fraq-doudizhu-'));
  const databasePath = join(directory, 'players.sqlite');
  try {
    await withDatabaseContext(
      databasePath,
      async (ctx) => {
        const calls = ctx.mock.apiCalls;
        const send = (text: string) => ctx.mock.receiveGroup({ groupId: GROUP_ID, userId: USER_ID }, inmsg`${text}`);

        await send('注册');
        await waitFor(() => sentMessages(calls, 'send_group_message').length === 1);
        await send('开始斗地主');
        await waitFor(() => sentMessages(calls, 'send_private_message').length === 1);

        await send('结束游戏');
        await waitFor(() => textOf(sentMessages(calls, 'send_group_message')).includes('你已退出本局'));

        await send('开始斗地主');
        await waitFor(() => sentMessages(calls, 'send_private_message').length === 2);
        assert.equal(imageCount(sentMessages(calls, 'send_private_message')), 2);

        await send('结束游戏');
        await waitFor(() => textOf(sentMessages(calls, 'send_group_message')).split('你已退出本局').length === 3);
      },
      10_000,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
