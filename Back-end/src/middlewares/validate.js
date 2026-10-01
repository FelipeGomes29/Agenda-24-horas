import { z } from 'zod'
import { HttpError } from '../utils/httpError.js'

/** validate({ body, params, query }) — troca os dados pelos já validados e normalizados. */
export const validate = (schemas) => (req, _res, next) => {
  for (const part of ['params', 'query', 'body']) {
    if (!schemas[part]) continue
    const result = schemas[part].safeParse(req[part])
    if (!result.success) {
      return next(new HttpError(400, 'Dados inválidos', z.flattenError(result.error)))
    }
    // req.query é somente leitura no Express 5: guardamos o resultado em req.valid
    req.valid = { ...req.valid, [part]: result.data }
  }
  next()
}
