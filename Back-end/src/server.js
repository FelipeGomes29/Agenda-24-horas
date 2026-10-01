import app from './app.js'
import { pool } from './config/db.js'
import { env } from './config/env.js'
import { migrate } from './database/migrate.js'

await migrate()

const server = app.listen(env.PORT, () => {
  console.log(`API do Planner 24h em http://localhost:${env.PORT}/api`)
})

async function shutdown(signal) {
  console.log(`${signal} recebido, encerrando...`)
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
