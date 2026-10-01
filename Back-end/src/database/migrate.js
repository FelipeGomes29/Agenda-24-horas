import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { pool } from '../config/db.js'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations')

export async function migrate({ log = console.log } = {}) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`)
  const applied = new Set((await pool.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name))
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()

  for (const file of files) {
    if (applied.has(file)) continue
    const sql = await readFile(path.join(dir, file), 'utf8')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
      await client.query('COMMIT')
      log(`migration aplicada: ${file}`)
    } catch (err) {
      await client.query('ROLLBACK')
      throw new Error(`Falha em ${file}: ${err.message}`)
    } finally {
      client.release()
    }
  }
}

// Execução direta: `npm run migrate`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate()
    .then(() => pool.end())
    .catch(async (err) => {
      console.error(err.message)
      await pool.end()
      process.exit(1)
    })
}
