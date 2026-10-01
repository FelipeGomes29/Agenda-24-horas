import { Router } from 'express'
import { pool } from '../config/db.js'
import tasksRoutes from './tasks.routes.js'

const router = Router()

router.get('/health', async (_req, res) => {
  await pool.query('SELECT 1')
  res.json({ status: 'ok' })
})
router.use('/tasks', tasksRoutes)

export default router
