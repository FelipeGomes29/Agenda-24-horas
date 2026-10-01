import { useLayoutEffect, useMemo, useRef } from 'react'
import { TriangleAlert } from 'lucide-react'
import { useTasks } from '../../context/TasksContext.jsx'
import { useNow } from '../../hooks/useNow.js'
import { formatDuration, minutesOfDay, toISODate, weekdayShort } from '../../utils/date.js'
import { DAY_MIN, HOUR_PX, busyMinutes, layoutLanes, minutesToPx, segmentForDay } from '../../utils/layout.js'
import DayColumn from './DayColumn.jsx'

const GUTTER = 56 // px: coluna das horas
const HOURS = Array.from({ length: 24 }, (_, h) => h)

/** Grade de 24 horas para 1 ou mais dias. Serve para a semana e para o dia. */
export default function TimeGrid({ days, minColumn = 120, onOpenTask, onCreateAt }) {
  const { tasks } = useTasks()
  const now = useNow()
  const todayISO = toISODate(now)
  const nowMinutes = minutesOfDay(now)
  const scrollRef = useRef(null)

  const columns = useMemo(() => {
    const scheduled = tasks.filter((t) => t.start)
    return days.map((date) => {
      const iso = toISODate(date)
      const segs = scheduled.map((t) => segmentForDay(t, iso)).filter(Boolean)
      const lanes = layoutLanes(segs)
      const conflicts = [...lanes.values()].filter((l) => l.conflict).length
      return { date, iso, segs, lanes, conflicts, free: DAY_MIN - busyMinutes(segs) }
    })
  }, [tasks, days])

  // Ao abrir, rola até perto de "agora" (ou 7h, se hoje não estiver na tela).
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const hasToday = days.some((d) => toISODate(d) === todayISO)
    const target = hasToday ? nowMinutes : 7 * 60
    el.scrollTop = Math.max(0, minutesToPx(target) - 140)
    // só na montagem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rowMinWidth = GUTTER + days.length * minColumn

  return (
    <div ref={scrollRef} className="h-full overflow-auto overscroll-contain bg-surface">
      {/* Cabeçalho dos dias */}
      <div className="sticky top-0 z-30 flex border-b border-line bg-surface" style={{ minWidth: rowMinWidth }}>
        <div className="sticky left-0 z-40 shrink-0 bg-surface" style={{ width: GUTTER }} />
        {columns.map((col) => {
          const isToday = col.iso === todayISO
          const busyPct = Math.round(((DAY_MIN - col.free) / DAY_MIN) * 100)
          return (
            <div
              key={col.iso}
              className="border-l border-line px-2.5 pb-2 pt-2"
              style={{ flex: '1 1 0', minWidth: minColumn }}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`num-display grid size-8 place-items-center rounded-full text-lg ${
                    isToday ? 'bg-primary text-primary-ink' : ''
                  }`}
                >
                  {col.date.getDate()}
                </span>
                <span className={`text-sm ${isToday ? 'font-semibold' : 'text-ink-soft'}`}>
                  {weekdayShort(col.date)}
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-sunken" aria-hidden="true">
                <div className="h-full rounded-full bg-ink/60" style={{ width: `${busyPct}%` }} />
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-ink-soft">
                <span>{formatDuration(col.free)} livres</span>
                {col.conflicts > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-danger">
                    <TriangleAlert size={12} aria-hidden="true" />
                    {col.conflicts} em conflito
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Corpo: horas + colunas */}
      <div className="flex" style={{ minWidth: rowMinWidth }}>
        <div
          className="sticky left-0 z-20 shrink-0 bg-surface"
          style={{ width: GUTTER, height: 24 * HOUR_PX }}
        >
          {/* Faixa do céu: mostra a luz do dia ao longo das 24h */}
          <div className="sky-strip absolute inset-y-0 right-0 w-1.5" aria-hidden="true" />
          {HOURS.map((h) => (
            <span
              key={h}
              className="absolute right-3 text-xs text-ink-soft"
              style={{ top: h * HOUR_PX, transform: h === 0 ? 'translateY(2px)' : 'translateY(-50%)' }}
            >
              {String(h).padStart(2, '0')}:00
            </span>
          ))}
        </div>

        {columns.map((col) => (
          <DayColumn
            key={col.iso}
            col={col}
            isToday={col.iso === todayISO}
            nowMinutes={nowMinutes}
            minColumn={minColumn}
            onOpenTask={onOpenTask}
            onCreateAt={onCreateAt}
          />
        ))}
      </div>
    </div>
  )
}
