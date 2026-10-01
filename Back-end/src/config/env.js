import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  // Lista separada por vírgulas. Nada de "*": só as origens do front-end.
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('Variáveis de ambiente inválidas:', z.flattenError(parsed.error).fieldErrors)
  process.exit(1)
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean),
}
