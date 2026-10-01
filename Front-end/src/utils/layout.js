import { dateFromMinutes } from './date.js'

export const HOUR_PX = 56
export const SNAP_MIN = 15
export const MIN_DURATION = 15
export const DAY_MIN = 1440

export const minutesToPx = (m) => (m / 60) * HOUR_PX
export const pxToMinutes = (px) => (px / HOUR_PX) * 60
export const snap = (m, step = SNAP_MIN) => Math.round(m / step) * step
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

/**
 * Parte de uma tarefa que cai dentro de um dia.
 * Uma tarefa que cruza a meia-noite gera dois segmentos (um em cada dia).
 */
export function segmentForDay(task, iso) {
  if (!task.start) return null
  const startMs = new Date(task.start).getTime()
  if (Number.isNaN(startMs)) return null
  const endMs = startMs + task.duration * 60000
  const dayStart = dateFromMinutes(iso, 0).getTime()
  const dayEnd = dateFromMinutes(iso, DAY_MIN).getTime()
  const s = Math.max(startMs, dayStart)
  const e = Math.min(endMs, dayEnd)
  if (e <= s) return null
  return {
    id: `${task.id}@${iso}`,
    task,
    start: Math.round((s - dayStart) / 60000),
    end: Math.round((e - dayStart) / 60000),
    offset: Math.round((s - startMs) / 60000), // minutos desde o início real da tarefa
    continuesBefore: s > startMs,
    continuesAfter: e < endMs,
  }
}

/**
 * Distribui segmentos sobrepostos em "faixas" lado a lado.
 * Retorna Map(id -> { lane, lanes, conflict }).
 */
export function layoutLanes(segments) {
  const sorted = [...segments].sort((a, b) => a.start - b.start || b.end - a.end)
  const result = new Map()
  let cluster = []
  let clusterEnd = -1

  const flush = () => {
    if (!cluster.length) return
    const laneEnds = []
    for (const s of cluster) {
      let lane = laneEnds.findIndex((end) => end <= s.start)
      if (lane === -1) {
        lane = laneEnds.length
        laneEnds.push(s.end)
      } else {
        laneEnds[lane] = s.end
      }
      s.lane = lane
    }
    for (const s of cluster) {
      const conflict = cluster.some((o) => o !== s && o.start < s.end && s.start < o.end)
      result.set(s.id, { lane: s.lane, lanes: laneEnds.length, conflict })
    }
    cluster = []
    clusterEnd = -1
  }

  for (const s of sorted) {
    if (cluster.length && s.start >= clusterEnd) flush()
    cluster.push({ ...s })
    clusterEnd = Math.max(clusterEnd, s.end)
  }
  flush()
  return result
}

/** Minutos ocupados no dia (união dos intervalos, sem contar sobreposição duas vezes). */
export function busyMinutes(segments) {
  const sorted = [...segments].sort((a, b) => a.start - b.start)
  let total = 0
  let curStart = null
  let curEnd = null
  for (const s of sorted) {
    if (curEnd === null || s.start > curEnd) {
      if (curEnd !== null) total += curEnd - curStart
      curStart = s.start
      curEnd = s.end
    } else {
      curEnd = Math.max(curEnd, s.end)
    }
  }
  if (curEnd !== null) total += curEnd - curStart
  return total
}
