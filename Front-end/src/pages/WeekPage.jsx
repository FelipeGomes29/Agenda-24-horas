import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import TimeGrid from '../components/week/TimeGrid.jsx'
import { useFocusDate } from '../hooks/useFocusDate.js'
import { weekDays } from '../utils/date.js'

export default function WeekPage() {
  const { date } = useFocusDate()
  const { openNew, openEdit } = useOutletContext()
  const days = useMemo(() => weekDays(date), [date])

  return (
    <div className="h-full min-h-0">
      <TimeGrid
        days={days}
        minColumn={120}
        onOpenTask={openEdit}
        onCreateAt={(start) => openNew({ start })}
      />
    </div>
  )
}
