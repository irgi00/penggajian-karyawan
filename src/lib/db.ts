import { Pool } from "pg";

const globalForPool = globalThis as typeof globalThis & {
  pool?: Pool;
};

const pool =
  globalForPool.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (!globalForPool.pool) {
  globalForPool.pool = pool;
}

export { pool };
