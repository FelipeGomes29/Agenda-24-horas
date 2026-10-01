import { useDraggable } from '@dnd-kit/core'
import { Check, Flag } from 'lucide-react'
import { useTasks } from '../../context/TasksContext.jsx'
import { CATEGORY_BY_ID, catStyle } from '../../utils/categories.js'
import { formatDuration } from '../../utils/date.js'

const stop = (e) => e.stopPropagation()

export default function InboxItem({ task, onOpen }) {
  const { toggleDone } = useTasks()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `inbox:${task.id}`,
    data: { type: 'inbox', task },
  })

  function onKeyDown(e) {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen(task)
    }
  }

  return (
    <li className="border-b border-line-soft last:border-b-0">
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={() => onOpen(task)}
        onKeyDown={onKeyDown}
        className={`cat flex cursor-grab touch-manipulation select-none items-start gap-2.5 px-4 py-2.5 hover:bg-sunken/70 ${
          isDragging ? 'opacity-30' : ''
        }`}
        style={catStyle(task.category)}
      >
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
          className={`mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full border-2 ${
            task.done ? 'border-transparent bg-[var(--tone)] text-white' : 'border-[var(--tone)]'
          }`}
        >
          {task.done && <Check size={11} strokeWidth={3.5} />}
        </button>

        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium leading-snug ${task.done ? 'text-ink-soft line-through' : ''}`}>
            {task.title}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <span className="cat-dot size-2 rounded-full" aria-hidden="true" />
              {CATEGORY_BY_ID[task.category]?.label}
            </span>
            <span>{formatDuration(task.duration)}</span>
            {task.priority === 'alta' && !task.done && (
              <span className="inline-flex items-center gap-1 text-danger">
                <Flag size={11} aria-hidden="true" />
                Alta
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}
