// Implementação local (localStorage). Usada quando VITE_API_URL não está definida.
//
// Hoje persiste em localStorage. Quando o back-end Express estiver pronto, troque
// só o corpo destas funções por chamadas HTTP (fetch/axios): o resto do app
// continua igual, porque todas já são assíncronas e retornam as mesmas formas.
//
//   GET    /api/tasks            -> getTasks()
//   POST   /api/tasks            -> createTask(data)
//   PATCH  /api/tasks/:id        -> updateTask(id, patch)
//   DELETE /api/tasks/:id        -> deleteTask(id)

import { CATEGORY_BY_ID, PRIORITY_RANK } from '../utils/categories.js'
import { addDays, isLocalDateTime, toISODate, today } from '../utils/date.js'

const KEY = 'planner:tasks:v1'

const DEFAULTS = {
  title: '',
  notes: '',
  category: 'pessoal',
  priority: 'media',
  duration: 60,
  start: null, // null = está na caixa (sem data)
  someday: false, // na caixa: "algum dia" em vez de "em breve"
  done: false,
}

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
}

/** Garante a forma e os limites dos campos (também protege contra dados adulterados no storage). */
function clean(raw) {
  const title = typeof raw.title === 'string' ? raw.title.trim().slice(0, 120) : ''
  if (!title) return null
  const duration = Number.isFinite(raw.duration) ? Math.round(raw.duration) : DEFAULTS.duration
  const start = isLocalDateTime(raw.start) ? raw.start : null
  return {
    title,
    notes: typeof raw.notes === 'string' ? raw.notes.slice(0, 1000) : '',
    category: CATEGORY_BY_ID[raw.category] ? raw.category : DEFAULTS.category,
    priority: raw.priority in PRIORITY_RANK ? raw.priority : DEFAULTS.priority,
    duration: Math.min(1440, Math.max(5, duration)),
    start,
    someday: start ? false : raw.someday === true,
    done: raw.done === true,
  }
}

function sanitizeStored(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string') return null
  const base = clean(raw)
  if (!base) return null
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString()
  return { id: raw.id, createdAt, ...base }
}

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(sanitizeStored).filter(Boolean) : null
  } catch {
    return null
  }
}

function write(tasks) {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks))
  } catch {
    throw new Error('storage-unavailable')
  }
}

function seed() {
  const t = today()
  const at = (offset, time) => `${toISODate(addDays(t, offset))}T${time}`
  const make = (o) => ({
    ...DEFAULTS,
    id: uid(),
    createdAt: new Date().toISOString(),
    ...o,
  })
  return [
    make({ title: 'Sono', category: 'rotina', duration: 480, start: at(-1, '23:00') }),
    make({ title: 'Sono', category: 'rotina', duration: 480, start: at(0, '23:00') }),
    make({ title: 'Estudar React Router', category: 'estudos', duration: 90, start: at(0, '09:00') }),
    make({ title: 'Reunião de alinhamento', category: 'trabalho', duration: 60, start: at(0, '14:00'), priority: 'alta' }),
    make({ title: 'Treino', category: 'saude', duration: 60, start: at(1, '19:00') }),
    make({ title: 'Revisar anotações da aula', category: 'estudos', duration: 45, start: at(2, '20:00') }),
    make({ title: 'Renovar documento do carro', category: 'casa', duration: 30, priority: 'alta' }),
    make({ title: 'Marcar dentista', category: 'saude', duration: 15 }),
    make({ title: 'Organizar arquivos do computador', category: 'pessoal', duration: 60, someday: true, priority: 'baixa' }),
    make({ title: 'Ler um livro de segurança de aplicações', category: 'estudos', duration: 120, someday: true }),
  ]
}

export async function getTasks() {
  let tasks = read()
  if (!tasks) {
    tasks = seed()
    write(tasks)
  }
  return tasks
}

export async function createTask(data) {
  const base = clean({ ...DEFAULTS, ...data })
  if (!base) throw new Error('invalid-task')
  const task = { id: uid(), createdAt: new Date().toISOString(), ...base }
  write([...(await getTasks()), task])
  return task
}

export async function updateTask(id, patch) {
  const tasks = await getTasks()
  const current = tasks.find((t) => t.id === id)
  if (!current) throw new Error('not-found')
  const base = clean({ ...current, ...patch })
  if (!base) throw new Error('invalid-task')
  const saved = { id: current.id, createdAt: current.createdAt, ...base }
  write(tasks.map((t) => (t.id === id ? saved : t)))
  return saved
}

export async function deleteTask(id) {
  const tasks = await getTasks()
  write(tasks.filter((t) => t.id !== id))
}
