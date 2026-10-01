import { catStyle } from '../../utils/categories.js'
import { formatDuration } from '../../utils/date.js'

/** Prévia que acompanha o cursor durante o arraste. */
export default function DragPreview({ task, width, height }) {
  return (
    <div
      className="cat cat-block cursor-grabbing overflow-hidden rounded-md px-2 py-1 shadow-xl ring-2 ring-sun"
      style={{ ...catStyle(task.category), width, height }}
    >
      <p className="truncate text-xs font-semibold leading-tight">{task.title}</p>
      <p className="text-[11px] leading-tight opacity-75">{formatDuration(task.duration)}</p>
    </div>
  )
}
