import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import FocusPanel from '../components/day/FocusPanel.jsx'
import TimeGrid from '../components/week/TimeGrid.jsx'
import { useFocusDate } from '../hooks/useFocusDate.js'

export default function DayPage() {
  const { date } = useFocusDate()
  const { openNew, openEdit } = useOutletContext()
  const days = useMemo(() => [date], [date])

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <div className="min-h-0 flex-1">
        <TimeGrid
          days={days}
          minColumn={240}
          onOpenTask={openEdit}
          onCreateAt={(start) => openNew({ start })}
        />
      </div>
      <FocusPanel date={date} onOpenTask={openEdit} />
    </div>
  )
}
