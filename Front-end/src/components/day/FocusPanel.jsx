import { Check, Inbox } from 'lucide-react'
import { useTasks } from '../../context/TasksContext.jsx'
import { useNow } from '../../hooks/useNow.js'
import { CATEGORY_BY_ID, catStyle } from '../../utils/categories.js'
import {
  dateFromMinutes,
  formatDuration,
  formatMinutes,
  minutesOfDay,
  toISODate,
  toLocalISO,
  weekdayShort,
} from '../../utils/date.js'
import { segmentForDay } from '../../utils/layout.js'

const startMs = (t) => new Date(t.start).getTime()
const endMs = (t) => startMs(t) + t.duration * 60000

function Block({ title, children }) {
  return (
    <section className="border-b border-line px-4 py-4 last:border-b-0">
      <h3 className="mb-2 text-sm font-semibold text-ink-soft">{title}</h3>
      {children}
    </section>
  )
}

function TaskLine({ task, onOpen, children }) {
  return (
    <div className="cat cat-block rounded-md px-3 py-2" style={catStyle(task.category)}>
      <button type="button" onClick={() => onOpen(task)} className="block w-full text-left">
        <p className="text-sm font-semibold leading-snug">{task.title}</p>
        <p className="text-xs opacity-75">
          {CATEGORY_BY_ID[task.category]?.label}, {formatDuration(task.duration)}
        </p>
      </button>
      {children}
    </div>
  )
}

export default function FocusPanel({ date, onOpenTask }) {
  const { tasks, toggleDone, updateTask, unschedule } = useTasks()
  const now = useNow()
  const nowMs = now.getTime()
  const iso = toISODate(date)
  const isToday = iso === toISODate(now)

  // Rotina (sono, deslocamento) conta no calendário, mas não entra no foco.
  const focusable = tasks.filter((t) => t.start && !t.done && t.category !== 'rotina')
  const current = isToday ? focusable.find((t) => startMs(t) <= nowMs && nowMs < endMs(t)) : null
  const next = isToday
    ? focusable.filter((t) => startMs(t) > nowMs).sort((a, b) => startMs(a) - startMs(b))[0]
    : null
  const overdue = isToday
    ? focusable.filter((t) => endMs(t) <= nowMs).sort((a, b) => endMs(b) - endMs(a))
    : []
  const dayTasks = tasks
    .filter((t) => segmentForDay(t, iso))
    .sort((a, b) => a.start.localeCompare(b.start))

  function rescheduleToNow(task) {
    const rounded = Math.ceil(minutesOfDay(now) / 15) * 15
    updateTask(task.id, { start: toLocalISO(dateFromMinutes(toISODate(now), rounded)) })
  }

  const describe = (t) => {
    const d = new Date(t.start)
    const sameDay = toISODate(d) === toISODate(now)
    return sameDay ? `hoje, ${formatMinutes(minutesOfDay(d))}` : `${weekdayShort(d)} ${d.getDate()}, ${formatMinutes(minutesOfDay(d))}`
  }

  return (
    <aside
      aria-label="Foco do dia"
      className="max-h-[45%] shrink-0 overflow-y-auto border-t border-line bg-surface lg:max-h-none lg:w-80 lg:border-l lg:border-t-0"
    >
      {isToday && (
        <Block title="Agora">
          {current ? (
            <TaskLine task={current} onOpen={onOpenTask}>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/15" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-[var(--tone)]"
                  style={{ width: `${Math.min(100, ((nowMs - startMs(current)) / (current.duration * 60000)) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs opacity-75">
                Faltam {formatDuration(Math.max(1, Math.ceil((endMs(current) - nowMs) / 60000)))}
              </p>
            </TaskLine>
          ) : (
            <p className="text-sm text-ink-soft">Nada agendado neste momento.</p>
          )}
          {next && (
            <p className="mt-3 text-sm">
              <span className="text-ink-soft">Próxima, {describe(next)}:</span>{' '}
              <button type="button" onClick={() => onOpenTask(next)} className="font-semibold underline underline-offset-2">
                {next.title}
              </button>
            </p>
          )}
        </Block>
      )}

      {overdue.length > 0 && (
        <Block title={`Atrasadas (${overdue.length})`}>
          <ul className="space-y-2">
            {overdue.slice(0, 5).map((t) => (
              <li key={t.id}>
                <TaskLine task={t} onOpen={onOpenTask}>
                  <p className="mt-0.5 text-xs opacity-75">Era {describe(t)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => rescheduleToNow(t)}
                      className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-ink"
                    >
                      Fazer agora
                    </button>
                    <button
                      type="button"
                      onClick={() => unschedule(t.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-current/30 px-2.5 py-1 text-xs"
                    >
                      <Inbox size={12} aria-hidden="true" />
                      Devolver à caixa
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDone(t)}
                      className="inline-flex items-center gap-1 rounded-md border border-current/30 px-2.5 py-1 text-xs"
                    >
                      <Check size={12} aria-hidden="true" />
                      Já fiz
                    </button>
                  </div>
                </TaskLine>
              </li>
            ))}
          </ul>
          {overdue.length > 5 && (
            <p className="mt-2 text-xs text-ink-soft">E mais {overdue.length - 5} atrasadas.</p>
          )}
        </Block>
      )}

      <Block title="Tarefas do dia">
        {dayTasks.length === 0 ? (
          <p className="text-sm leading-relaxed text-ink-soft">
            Dia livre. Clique na grade para criar uma tarefa ou arraste algo da caixa.
          </p>
        ) : (
          <ul className="space-y-1">
            {dayTasks.map((t) => (
              <li key={t.id} className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleDone(t)}
                  aria-label={t.done ? 'Marcar como pendente' : 'Marcar como concluída'}
                  aria-pressed={t.done}
                  className={`cat grid size-[18px] shrink-0 place-items-center rounded-full border-2 border-[var(--tone)] ${
                    t.done ? 'bg-[var(--tone)] text-white' : ''
                  }`}
                  style={catStyle(t.category)}
                >
                  {t.done && <Check size={11} strokeWidth={3.5} />}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenTask(t)}
                  className={`min-w-0 flex-1 py-1 text-left text-sm ${t.done ? 'text-ink-soft line-through' : ''}`}
                >
                  <span className="block truncate">{t.title}</span>
                  <span className="block text-xs text-ink-soft">
                    {formatMinutes(minutesOfDay(new Date(t.start)))}, {formatDuration(t.duration)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Block>
    </aside>
  )
}
