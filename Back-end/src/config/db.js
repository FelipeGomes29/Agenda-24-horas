import pg from 'pg'
import { env } from './env.js'

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

pool.on('error', (err) => {
  console.error('Erro inesperado em conexão ociosa do pool:', err.message)
})

// Sempre consultas parametrizadas: nunca concatene entrada do usuário no SQL.
export const query = (text, params) => pool.query(text, params)
