import { HttpError } from '../utils/httpError.js'

export function notFoundHandler(_req, _res, next) {
  next(new HttpError(404, 'Rota não encontrada'))
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.details && { details: err.details }) })
  }
  // JSON malformado ou corpo grande demais (body-parser)
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' })
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Corpo da requisição grande demais' })

  // Qualquer outra coisa: loga por dentro, responde genérico por fora (sem stack nem SQL).
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor' })
}
