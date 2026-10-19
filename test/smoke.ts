import { Context } from '@fraqjs/fraq';
import KyselyPlugin from '@fraqjs/plugin-kysely';
import { createSimpleLogHandler } from '@fraqjs/plugin-mock';

import DoudizhuPlugin from '../src';

const ctx = Context.fromUrl('http://localhost:30001', {
  logHandler: createSimpleLogHandler(),
});

ctx.install(KyselyPlugin, { sqliteUrl: './fraq.db' });
ctx.install(DoudizhuPlugin);
ctx.start();

process.on('SIGINT', async () => {
  await ctx.stop();
  process.exit(0);
});
