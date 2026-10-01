import * as repo from '../repositories/tasks.repository.js'
import { HttpError } from '../utils/httpError.js'

const notFound = () => new HttpError(404, 'Tarefa não encontrada')

export function list({ from, to } = {}) {
  if (from || to) return repo.findScheduledBetween(from ?? '0001-01-01', to ?? '9999-12-31')
  return repo.findAll()
}

export const listInbox = () => repo.findInbox()

export async function get(id) {
  const task = await repo.findById(id)
  if (!task) throw notFound()
  return task
}

export function create(data) {
  // Regra de negócio: quem tem horário não pode estar marcado como "algum dia".
  return repo.insert({ ...data, someday: data.start ? false : data.someday })
}

export async function update(id, patch) {
  const next = { ...patch }
  if (next.start) next.someday = false
  const task = await repo.update(id, next)
  if (!task) throw notFound()
  return task
}

export async function remove(id) {
  if (!(await repo.remove(id))) throw notFound()
}
