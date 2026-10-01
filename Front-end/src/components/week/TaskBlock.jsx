import { useRef, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Check, Flag, TriangleAlert } from 'lucide-react'
import { useTasks } from '../../context/TasksContext.jsx'
import { catStyle } from '../../utils/categories.js'
import { formatMinutes } from '../../utils/date.js'
import { DAY_MIN, MIN_DURATION, clamp, minutesToPx, pxToMinutes, snap } from '../../utils/layout.js'

const stop = (e) => e.stopPropagation()

export default function TaskBlock({ seg, lane, onOpen }) {
  const { task } = seg
  const { toggleDone, updateTask } = useTasks()
  const [liveDuration, setLiveDuration] = useState(null)
  const resize = useRef(null)

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `block:${seg.id}`,
    data: { type: 'block', task, segOffset: seg.offset, segMinutes: seg.end - seg.start },
  })

  // Durante o redimensionamento, o fim vem da duração "ao vivo".
  const duration = liveDuration ?? task.duration
  const end = Math.min(DAY_MIN, seg.start + duration - seg.offset)
  const height = Math.max(minutesToPx(end - seg.start) - 1, 20)
  const compact = height < 40

  function onResizeDown(e) {
    e.stopPropagation()
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    resize.current = { y: e.clientY, duration: task.duration, live: task.duration }
  }
  function onResizeMove(e) {
    const r = resize.current
    if (!r) return
    r.live = clamp(snap(r.duration + pxToMinutes(e.clientY - r.y)), MIN_DURATION, DAY_MIN)
    setLiveDuration(r.live)
  }
  function onResizeUp(e) {
    const r = resize.current
    if (!r) return
    resize.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    setLiveDuration(null)
    if (r.live !== task.duration) updateTask(task.id, { duration: r.live })
  }

  function onKeyDown(e) {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen(task)
    }
  }

  const label = `${task.title}, das ${formatMinutes(seg.start)} às ${formatMinutes(end)}${task.done ? ', concluída' : ''}`

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation()
        onOpen(task)
      }}
      onKeyDown={onKeyDown}
      aria-label={label}
      className={`cat cat-block group absolute z-[1] cursor-grab touch-manipulation select-none overflow-hidden rounded-md px-1.5 text-left text-xs shadow-sm transition-opacity ${
        lane.conflict ? 'ring-1 ring-danger' : ''
      } ${isDragging ? 'opacity-30' : task.done ? 'opacity-60' : ''}`}
      style={{
        ...catStyle(task.category),
        top: minutesToPx(seg.start),
        height,
        left: `calc(${(lane.lane / lane.lanes) * 100}% + 2px)`,
        width: `calc(${100 / lane.lanes}% - 4px)`,
      }}
    >
      <div className={`flex gap-1.5 ${compact ? 'items-center pt-0.5' : 'items-start pt-1'}`}>
        <button
          type="button"
          aria-label={task.done ? 'Marcar como pendente' : 'Marcar como concluída'}
          aria-pressed={task.done}
          onMouseDown={stop}
          onTouchStart={stop}
          onClick={(e) => {
            e.stopPropagation()
            toggleDone(task)
          }}
          className={`grid size-4 shrink-0 place-items-center rounded-full border-[1.5px] border-current ${
            task.done ? 'bg-current' : ''
          }`}
        >
          {task.done && <Check size={10} strokeWidth={3.5} className="text-[var(--tint)]" />}
        </button>

        <div className="min-w-0 flex-1">
          <p className={`truncate font-semibold leading-tight ${task.done ? 'line-through' : ''}`}>
            {task.title}
          </p>
          {!compact && (
            <p className="mt-0.5 text-[11px] leading-tight opacity-75">
              {formatMinutes(seg.start)} às {formatMinutes(end)}
            </p>
          )}
        </div>

        {task.priority === 'alta' && !task.done && (
          <Flag size={11} className="mt-0.5 shrink-0 text-danger" aria-label="Prioridade alta" />
        )}
        {lane.conflict && (
          <TriangleAlert size={12} className="mt-0.5 shrink-0 text-danger" aria-label="Conflito de horário" />
        )}
      </div>

      {!seg.continuesAfter && (
        <div
          role="separator"
          aria-label="Ajustar duração"
          onPointerDown={onResizeDown}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeUp}
          onPointerCancel={onResizeUp}
          onMouseDown={stop}
          onTouchStart={stop}
          onClick={stop}
          className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize touch-none"
        >
          <div className="mx-auto mt-1 h-0.5 w-6 rounded-full bg-current opacity-0 transition-opacity group-hover:opacity-40" />
        </div>
      )}
    </div>
  )
}
