import { z } from 'zod'

const CATEGORIES = ['trabalho', 'estudos', 'pessoal', 'saude', 'casa', 'rotina']
const PRIORITIES = ['alta', 'media', 'baixa']

// 'YYYY-MM-DDTHH:mm' real: recusa 2026-02-30 e 25:99.
const localDateTime = z.string().refine((s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(s)
  if (!m) return false
  const [y, mo, d, h, mi] = m.slice(1).map(Number)
  const dt = new Date(Date.UTC(y, mo - 1, d, h, mi))
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === mo - 1 &&
    dt.getUTCDate() === d &&
    dt.getUTCHours() === h &&
    dt.getUTCMinutes() === mi
  )
}, 'Use o formato YYYY-MM-DDTHH:mm com data e hora válidas')

const fields = {
  title: z.string().trim().min(1, 'Informe o título').max(120, 'Título com até 120 caracteres'),
  notes: z.string().max(1000, 'Anotações com até 1000 caracteres'),
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES),
  duration: z.number().int().min(5, 'Mínimo de 5 minutos').max(1440, 'Máximo de 24 horas'),
  start: localDateTime.nullable(),
  someday: z.boolean(),
  done: z.boolean(),
}

// `.strict()` recusa campos desconhecidos (id, createdAt...), evitando "mass assignment".
export const createTaskSchema = z
  .object({
    title: fields.title,
    notes: fields.notes.default(''),
    category: fields.category.default('pessoal'),
    priority: fields.priority.default('media'),
    duration: fields.duration.default(60),
    start: fields.start.default(null),
    someday: fields.someday.default(false),
    done: fields.done.default(false),
  })
  .strict()

export const updateTaskSchema = z
  .object(fields)
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, 'Envie ao menos um campo para atualizar')

export const idParamSchema = z.object({ id: z.uuid('Identificador inválido') })

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')

export const listQuerySchema = z
  .object({ from: isoDate.optional(), to: isoDate.optional() })
  .strict()
  .refine((q) => !q.from || !q.to || q.from <= q.to, 'from não pode ser depois de to')
