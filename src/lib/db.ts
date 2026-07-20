import { Pool } from "pg";

let pool: Pool;

if (!global.pool) {
  global.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}
pool = global.pool;

export { pool };

declare global {
  // eslint-disable-next-line no-var
  var pool: Pool;
}
