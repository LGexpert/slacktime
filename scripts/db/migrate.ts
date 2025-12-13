import { migrate } from 'drizzle-orm/node-postgres/migrator'

import { createDb, createPool } from '../../db/client'

const pool = createPool()
const db = createDb(pool)

await migrate(db, { migrationsFolder: 'drizzle' })

await pool.end()
