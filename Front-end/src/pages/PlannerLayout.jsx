import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { X } from 'lucide-react'
import Header from '../components/layout/Header.jsx'
import InboxPanel from '../components/inbox/InboxPanel.jsx'
import DragPreview from '../components/tasks/DragPreview.jsx'
import TaskModal from '../components/tasks/TaskModal.jsx'
import { useTasks } from '../context/TasksContext.jsx'
import { dateFromMinutes, toLocalISO } from '../utils/date.js'
import { DAY_MIN, SNAP_MIN, clamp, minutesToPx, pxToMinutes, snap } from '../utils/layout.js'
import { INBOX_GRAB, getPointer, snapInboxToCursor } from '../utils/pointer.js'

// Quem recebe o drop é decidido pela posição do ponteiro (mais previsível que a área da prévia).
const collisionDetection = (args) => {
  const hits = pointerWithin(args)
  return hits.length ? hits : rectIntersection(args)
}

export default function PlannerLayout() {
  const { tasks, error, clearError, addTask, updateTask, removeTask, schedule, unschedule } = useTasks()
  const [modal, setModal] = useState(null) // { key, task?, defaults? }
  const [inboxOpen, setInboxOpen] = useState(false)
  const [drag, setDrag] = useState(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  )

  const openNew = useCallback((defaults = {}) => setModal({ key: Date.now(), defaults }), [])
  const openEdit = useCallback((task) => setModal({ key: task.id, task }), [])
  const closeModal = useCallback(() => setModal(null), [])
  const inboxCount = tasks.filter((t) => !t.start && !t.done).length

  function handleDragStart({ active }) {
    setDrag({ ...active.data.current, width: active.rect.current.initial?.width ?? 140 })
  }

  function handleDragEnd({ active, over, delta, activatorEvent }) {
    setDrag(null)
    if (!over) return
    const data = active.data.current
    const { task } = data

    if (over.id === 'inbox') {
      if (task.start) unschedule(task.id)
      return
    }

    const iso = over.data.current?.iso
    const column = iso && document.querySelector(`[data-day-column="${iso}"]`)
    const pointer = getPointer(activatorEvent)
    if (!column || !pointer) return

    // Topo da prévia = posição do ponteiro menos o ponto onde ela foi "segurada".
    const grabY = data.type === 'inbox' ? INBOX_GRAB.y : pointer.y - (active.rect.current.initial?.top ?? pointer.y)
    const topInViewport = pointer.y + delta.y - grabY
    const minutes = clamp(snap(pxToMinutes(topInViewport - column.getBoundingClientRect().top)), 0, DAY_MIN - SNAP_MIN)

    // Se o segmento arrastado é a continuação de uma tarefa da noite anterior, recua o início.
    const offset = data.segOffset ?? 0
    schedule(task.id, toLocalISO(dateFromMinutes(iso, minutes - offset)))
  }

  function handleSave(data) {
    if (modal?.task) updateTask(modal.task.id, data)
    else addTask(data)
  }

  const previewHeight = drag
    ? Math.max(minutesToPx(drag.type === 'block' ? drag.segMinutes : drag.task.duration), 28)
    : 0

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDrag(null)}
    >
      <div className="flex h-dvh flex-col">
        <Header
          onNewTask={() => openNew()}
          onToggleInbox={() => setInboxOpen((v) => !v)}
          inboxCount={inboxCount}
        />

        {error && (
          <div role="alert" className="flex items-center justify-between gap-3 bg-danger px-4 py-2 text-sm text-white">
            <span>{error}</span>
            <button type="button" onClick={clearError} aria-label="Dispensar aviso" className="shrink-0">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="relative flex min-h-0 flex-1">
          <InboxPanel open={inboxOpen} onClose={() => setInboxOpen(false)} onOpenTask={(t) => { setInboxOpen(false); openEdit(t) }} />
          <main className="min-w-0 flex-1">
            <Outlet context={{ openNew, openEdit }} />
          </main>
        </div>
      </div>

      <DragOverlay dropAnimation={null} modifiers={drag?.type === 'inbox' ? [snapInboxToCursor] : []}>
        {drag && <DragPreview task={drag.task} width={drag.type === 'inbox' ? 150 : drag.width} height={previewHeight} />}
      </DragOverlay>

      {modal && (
        <TaskModal
          key={modal.key}
          task={modal.task}
          defaults={modal.defaults}
          onSave={handleSave}
          onDelete={removeTask}
          onClose={closeModal}
        />
      )}
    </DndContext>
  )
}
