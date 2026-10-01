import { query } from '../config/db.js'

// Formato devolvido ao front: duration em minutos, start como 'YYYY-MM-DDTHH:mm' ou null.
const COLUMNS = `
  id, title, notes, category, priority,
  duration_min AS duration,
  to_char(start_at, 'YYYY-MM-DD"T"HH24:MI') AS start,
  someday, done,
  created_at AS "createdAt"`

// Lista fixa de colunas atualizáveis: o nome da coluna nunca vem do cliente.
const UPDATABLE = {
  title: 'title',
  notes: 'notes',
  category: 'category',
  priority: 'priority',
  duration: 'duration_min',
  start: 'start_at',
  someday: 'someday',
  done: 'done',
}

export async function findAll() {
  const { rows } = await query(`SELECT ${COLUMNS} FROM tasks ORDER BY start_at NULLS LAST, created_at`)
  return rows
}

export async function findInbox() {
  const { rows } = await query(`SELECT ${COLUMNS} FROM tasks WHERE start_at IS NULL ORDER BY created_at`)
  return rows
}

/** Tarefas agendadas que tocam o intervalo [from, to] (inclusive), mesmo as que cruzam a meia-noite. */
export async function findScheduledBetween(from, to) {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM tasks
      WHERE start_at IS NOT NULL
        AND start_at < ($2::date + 1)
        AND start_at + make_interval(mins => duration_min) > $1::date
      ORDER BY start_at`,
    [from, to],
  )
  return rows
}

export async function findById(id) {
  const { rows } = await query(`SELECT ${COLUMNS} FROM tasks WHERE id = $1`, [id])
  return rows[0] ?? null
}

export async function insert(t) {
  const { rows } = await query(
    `INSERT INTO tasks (title, notes, category, priority, duration_min, start_at, someday, done)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${COLUMNS}`,
    [t.title, t.notes, t.category, t.priority, t.duration, t.start, t.someday, t.done],
  )
  return rows[0]
}

export async function update(id, patch) {
  const sets = []
  const values = []
  for (const [key, value] of Object.entries(patch)) {
    const column = UPDATABLE[key]
    if (!column) continue
    values.push(value)
    sets.push(`${column} = $${values.length}`)
  }
  values.push(id)
  const { rows } = await query(
    `UPDATE tasks SET ${sets.join(', ')}, updated_at = now() WHERE id = $${values.length} RETURNING ${COLUMNS}`,
    values,
  )
  return rows[0] ?? null
}

export async function remove(id) {
  const { rowCount } = await query('DELETE FROM tasks WHERE id = $1', [id])
  return rowCount > 0
}
