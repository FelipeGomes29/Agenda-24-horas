// Datas "locais" (sem fuso): o planner trabalha com o relógio da pessoa.
// Formatos usados: 'YYYY-MM-DD' (dia) e 'YYYY-MM-DDTHH:mm' (início da tarefa).

export const WEEK_STARTS_ON = 1 // 0 = domingo, 1 = segunda

const pad = (n) => String(n).padStart(2, '0')
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function toISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseISODate(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isISODate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  return toISODate(parseISODate(s)) === s
}

export function isLocalDateTime(s) {
  return (
    typeof s === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s) &&
    !Number.isNaN(new Date(s).getTime())
  )
}

export function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function today() {
  return startOfDay(new Date())
}

export function addDays(d, n) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() + n)
  return x
}

export function startOfWeek(d) {
  const x = startOfDay(d)
  const diff = (x.getDay() - WEEK_STARTS_ON + 7) % 7
  return addDays(x, -diff)
}

export function weekDays(d) {
  const start = startOfWeek(d)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function dateFromMinutes(iso, minutes) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 0, minutes, 0, 0)
}

export function toLocalISO(d) {
  return `${toISODate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const isoDateOf = (start) => start.slice(0, 10)
export const isoTimeOf = (start) => start.slice(11, 16)
export const minutesOfDay = (d) => d.getHours() * 60 + d.getMinutes()

export function formatMinutes(min) {
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`
}

export function formatDuration(min) {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h${pad(m)}` : `${h}h`
}

const weekdayFmt = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
export const weekdayShort = (d) => weekdayFmt.format(d).replace('.', '')

const dayLongFmt = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
export const formatDayLong = (d) => dayLongFmt.format(d)

export function formatDayMonth(d) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function formatWeekRange(days) {
  const first = days[0]
  const last = days[days.length - 1]
  const sameYear = first.getFullYear() === last.getFullYear()
  const a = sameYear ? formatDayMonth(first) : `${formatDayMonth(first)} ${first.getFullYear()}`
  return `${a} a ${formatDayMonth(last)} ${last.getFullYear()}`
}
