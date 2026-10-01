import { useMemo, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Plus, X } from 'lucide-react'
import { useTasks } from '../../context/TasksContext.jsx'
import { CATEGORIES, PRIORITY_RANK } from '../../utils/categories.js'
import InboxItem from './InboxItem.jsx'

const byPriority = (a, b) =>
  PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.createdAt.localeCompare(b.createdAt)

function Section({ title, tasks, onOpenTask }) {
  if (!tasks.length) return null
  return (
    <section className="mb-1">
      <h3 className="px-4 pb-1 pt-3 text-sm font-semibold text-ink-soft">
        {title} <span className="font-normal">({tasks.length})</span>
      </h3>
      <ul>
        {tasks.map((t) => (
          <InboxItem key={t.id} task={t} onOpen={onOpenTask} />
        ))}
      </ul>
    </section>
  )
}

export default function InboxPanel({ open, onClose, onOpenTask }) {
  const { tasks, addTask } = useTasks()
  const { setNodeRef, isOver } = useDroppable({ id: 'inbox' })
  const [title, setTitle] = useState('')
  const [someday, setSomeday] = useState(false)
  const [filter, setFilter] = useState('todas')

  const inbox = useMemo(
    () => tasks.filter((t) => !t.start && (filter === 'todas' || t.category === filter)).sort(byPriority),
    [tasks, filter],
  )
  const pending = inbox.filter((t) => !t.done)
  const soon = pending.filter((t) => !t.someday)
  const later = pending.filter((t) => t.someday)
  const done = inbox.filter((t) => t.done)
  const total = tasks.filter((t) => !t.start && !t.done).length

  async function handleAdd(e) {
    e.preventDefault()
    const value = title.trim()
    if (!value) return
    setTitle('')
    await addTask({ title: value, someday, category: filter === 'todas' ? 'pessoal' : filter })
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        ref={setNodeRef}
        aria-label="Caixa de tarefas sem data"
        className={`fixed inset-y-0 left-0 z-50 flex w-80 max-w-[88vw] flex-col border-r border-line bg-surface transition-transform md:static md:z-auto md:w-72 md:max-w-none md:shrink-0 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${isOver ? 'bg-sun/10 shadow-[inset_0_0_0_2px_var(--sun)]' : ''}`}
      >
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <div>
            <h2 className="text-lg font-bold leading-tight">Caixa</h2>
            <p className="text-xs text-ink-soft">
              {total === 0 ? 'Nada esperando por uma data' : `${total} sem data`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar a caixa"
            className="grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-sunken md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleAdd} className="px-4 pb-2">
          <div className="flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="O que precisa ser feito?"
              aria-label="Nova tarefa para a caixa"
              className="min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3 py-2 text-sm placeholder:text-ink-soft focus:border-ink"
            />
            <button
              type="submit"
              aria-label="Adicionar à caixa"
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-ink disabled:opacity-40"
              disabled={!title.trim()}
            >
              <Plus size={18} />
            </button>
          </div>
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
            <input
              type="checkbox"
              checked={someday}
              onChange={(e) => setSomeday(e.target.checked)}
              className="size-3.5 accent-[var(--ink)]"
            />
            Guardar como "algum dia"
          </label>
        </form>

        <div className="flex gap-1.5 overflow-x-auto px-4 pb-2 pt-1" role="group" aria-label="Filtrar por categoria">
          {[{ id: 'todas', label: 'Todas' }, ...CATEGORIES.filter((c) => c.id !== 'rotina')].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id)}
              aria-pressed={filter === c.id}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs ${
                filter === c.id
                  ? 'border-primary bg-primary text-primary-ink'
                  : 'border-line text-ink-soft hover:border-ink-soft'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-line pb-6">
          {pending.length === 0 && done.length === 0 && (
            <p className="px-4 py-8 text-sm leading-relaxed text-ink-soft">
              Escreva o que vier à cabeça, sem se preocupar com quando. Depois arraste para a semana
              quando decidir o horário.
            </p>
          )}
          <Section title="Em breve" tasks={soon} onOpenTask={onOpenTask} />
          <Section title="Algum dia" tasks={later} onOpenTask={onOpenTask} />
          {done.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer px-4 py-2 text-sm font-semibold text-ink-soft">
                Concluídas ({done.length})
              </summary>
              <ul>
                {done.map((t) => (
                  <InboxItem key={t.id} task={t} onOpen={onOpenTask} />
                ))}
              </ul>
            </details>
          )}
        </div>
      </aside>
    </>
  )
}
