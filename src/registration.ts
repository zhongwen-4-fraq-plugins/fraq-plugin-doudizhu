import type { KyselyService, SchemaDefinition } from '@fraqjs/plugin-kysely';

interface DoudizhuRegisteredUserTable {
  readonly user_id: number;
  readonly registered_at: string;
}

declare module '@fraqjs/plugin-kysely' {
  interface FraqDatabase {
    doudizhu_registered_users: DoudizhuRegisteredUserTable;
  }
}

export const doudizhuSchema: SchemaDefinition = {
  name: 'doudizhu',
  migrations: {
    '001_create_registered_users': {
      up: (db) =>
        db.schema
          .createTable('doudizhu_registered_users')
          .ifNotExists()
          .addColumn('user_id', 'integer', (column) => column.primaryKey())
          .addColumn('registered_at', 'text', (column) => column.notNull())
          .execute(),
    },
  },
};

export async function registerUser(database: KyselyService, userId: number): Promise<boolean> {
  const inserted = await database.db
    .insertInto('doudizhu_registered_users')
    .values({ user_id: userId, registered_at: new Date().toISOString() })
    .onConflict((conflict) => conflict.column('user_id').doNothing())
    .returning('user_id')
    .executeTakeFirst();
  return inserted !== undefined;
}

export async function isRegistered(database: KyselyService, userId: number): Promise<boolean> {
  const user = await database.db
    .selectFrom('doudizhu_registered_users')
    .select('user_id')
    .where('user_id', '=', userId)
    .executeTakeFirst();
  return user !== undefined;
}
