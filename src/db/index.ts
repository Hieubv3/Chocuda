import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

declare global {
  var _postgresPool: Pool | undefined;
}

export const isPostgresConfigured = (): boolean => {
  // Support both Supabase connection string (DATABASE_URL) and individual SQL_* vars
  return Boolean(
    process.env.DATABASE_URL ||
    process.env.SQL_HOST ||
    process.env.PGHOST
  );
};

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL;
    global._postgresPool = connectionString
      ? new Pool({
          connectionString,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        })
      : new Pool({
          host: process.env.SQL_HOST,
          user: process.env.SQL_USER,
          password: process.env.SQL_PASSWORD,
          database: process.env.SQL_DB_NAME,
          port: process.env.SQL_PORT ? Number(process.env.SQL_PORT) : 5432,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });
  }
  return global._postgresPool;
};

export const pool = createPool();
export const db = drizzle(pool, { schema });