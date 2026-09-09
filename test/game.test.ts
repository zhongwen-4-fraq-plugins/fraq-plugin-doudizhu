import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DoudizhuGame, RoomManager } from '../src/game.js';

test('连续三轮无人叫地主后随机选择地主', async () => {
  const game = new DoudizhuGame('100', '测试玩家', {
    timeoutMs: 10_000,
    random: () => 0,
  });
  game.players[1].hand = [];
  game.players[2].hand = [];
  await game.begin();

  await game.act('100', { type: 'bid', level: 0 });
  await game.act('100', { type: 'bid', level: 0 });
  const events = await game.act('100', { type: 'bid', level: 0 });

  assert.equal(game.landlordIndex, 0);
  assert.equal(game.phase, 'doubling');
  assert.equal(events.some((event) => event.type === 'message' && event.text.includes('随机选择地主')), true);
  game.dispose();
});

test('房间达到上限后拒绝创建，移除后可以复用', () => {
  const manager = new RoomManager(2, { timeoutMs: 10_000 });
  const first = manager.create('1', '一号');
  const second = manager.create('2', '二号');
  assert.throws(() => manager.create('3', '三号'), /2 个房间/);
  manager.remove(first.id);
  const third = manager.create('3', '三号');
  assert.equal(manager.list().length, 2);
  manager.remove(second.id);
  manager.remove(third.id);
});

test('房间超时后自动回收并触发回调', async () => {
  let expired = 0;
  const manager = new RoomManager(1, { timeoutMs: 20 }, () => {
    expired += 1;
  });
  manager.create('1', '一号');
  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(expired, 1);
  assert.equal(manager.list().length, 0);
});
