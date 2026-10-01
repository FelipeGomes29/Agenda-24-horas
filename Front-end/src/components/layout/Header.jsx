import { NavLink, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Inbox, Moon, Plus, Sun, Sunrise } from 'lucide-react'
import { useFocusDate } from '../../hooks/useFocusDate.js'
import { useTheme } from '../../hooks/useTheme.js'
import { addDays, formatDayLong, formatWeekRange, today, weekDays } from '../../utils/date.js'

const tab = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm ${
    isActive ? 'bg-primary font-semibold text-primary-ink' : 'text-ink-soft hover:bg-sunken hover:text-ink'
  }`

export default function Header({ onNewTask, onToggleInbox, inboxCount }) {
  const { theme, toggle } = useTheme()
  const { date, setDate } = useFocusDate()
  const { pathname, search } = useLocation()

  const isDay = pathname.startsWith('/dia')
  const step = isDay ? 1 : 7
  const label = isDay ? formatDayLong(date) : formatWeekRange(weekDays(date))

  return (
    <header className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line bg-surface px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-ink">
          <Sunrise size={18} aria-hidden="true" />
        </span>
        <h1 className="text-lg font-bold tracking-tight">Planner 24h</h1>
      </div>

      <nav aria-label="Visualização" className="flex gap-1">
        <NavLink to={{ pathname: '/semana', search }} className={tab}>
          Semana
        </NavLink>
        <NavLink to={{ pathname: '/dia', search }} className={tab}>
          Dia
        </NavLink>
      </nav>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setDate(addDays(date, -step))}
          aria-label={isDay ? 'Dia anterior' : 'Semana anterior'}
          className="grid size-9 place-items-center rounded-lg hover:bg-sunken"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => setDate(today())}
          className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-sunken"
        >
          Hoje
        </button>
        <button
          type="button"
          onClick={() => setDate(addDays(date, step))}
          aria-label={isDay ? 'Próximo dia' : 'Próxima semana'}
          className="grid size-9 place-items-center rounded-lg hover:bg-sunken"
        >
          <ChevronRight size={18} />
        </button>
        <p className="ml-2 text-sm font-medium first-letter:uppercase" aria-live="polite">
          {label}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleInbox}
          className="relative inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-sunken md:hidden"
        >
          <Inbox size={16} aria-hidden="true" />
          Caixa
          {inboxCount > 0 && (
            <span className="rounded-full bg-sun px-1.5 text-xs font-semibold text-black">{inboxCount}</span>
          )}
        </button>

        <button
          type="button"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'}
          className="grid size-9 place-items-center rounded-lg border border-line hover:bg-sunken"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button
          type="button"
          onClick={onNewTask}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-ink"
        >
          <Plus size={16} aria-hidden="true" />
          Nova tarefa
        </button>
      </div>
    </header>
  )
}
