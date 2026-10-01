import { useDroppable } from '@dnd-kit/core'
import { dateFromMinutes, toLocalISO } from '../../utils/date.js'
import { DAY_MIN, HOUR_PX, SNAP_MIN, clamp, minutesToPx, pxToMinutes } from '../../utils/layout.js'
import TaskBlock from './TaskBlock.jsx'

export default function DayColumn({ col, isToday, nowMinutes, minColumn, onOpenTask, onCreateAt }) {
  const { setNodeRef, isOver } = useDroppable({ id: `day:${col.iso}`, data: { iso: col.iso } })

  // Clique no espaço vazio cria uma tarefa naquele horário.
  function handleClick(e) {
    if (e.target !== e.currentTarget) return
    const rect = e.currentTarget.getBoundingClientRect()
    const raw = Math.floor(pxToMinutes(e.clientY - rect.top) / SNAP_MIN) * SNAP_MIN
    const minutes = clamp(raw, 0, DAY_MIN - SNAP_MIN)
    onCreateAt(toLocalISO(dateFromMinutes(col.iso, minutes)))
  }

  return (
    <div
      ref={setNodeRef}
      data-day-column={col.iso}
      onClick={handleClick}
      className={`hour-lines sky-wash relative cursor-cell border-l border-line ${
        isOver ? 'bg-sun/15' : ''
      }`}
      style={{ flex: '1 1 0', minWidth: minColumn, height: 24 * HOUR_PX, '--hour-px': `${HOUR_PX}px` }}
    >
      {col.segs.map((seg) => (
        <TaskBlock key={seg.id} seg={seg} lane={col.lanes.get(seg.id)} onOpen={onOpenTask} />
      ))}

      {isToday && (
        <div
          className="pointer-events-none absolute inset-x-0 z-10"
          style={{ top: minutesToPx(nowMinutes) }}
          aria-hidden="true"
        >
          <div className="h-0.5 bg-sun" />
          <div className="absolute -left-1.5 -top-[5px] size-3 rounded-full bg-sun shadow-[0_0_0_3px_color-mix(in_srgb,var(--sun)_30%,transparent)]" />
        </div>
      )}
    </div>
  )
}
