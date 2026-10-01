import cors from 'cors'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'
import routes from './routes/index.js'

const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: env.corsOrigins, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }))
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.NODE_ENV === 'test' ? 10_000 : 600,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Muitas requisições. Tente novamente em instantes.' },
  }),
)
app.use(express.json({ limit: '10kb' }))

app.use('/api', routes)
app.use(notFoundHandler)
app.use(errorHandler)

export default app
