import 'dotenv/config'

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from '../src/db/schema'

export type DbClient = ReturnType<typeof createDb>

export function createPool(connectionString = process.env.DATABASE_URL): Pool {
  if (!connectionString) {
    throw new Error('DATABASE_URL is required (e.g. postgres://user:pass@localhost:5432/music_stream)')
  }

  return new Pool({ connectionString })
}

export function createDb(pool = createPool()) {
  return drizzle(pool, { schema })
}
