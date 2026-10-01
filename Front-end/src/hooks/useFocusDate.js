import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isISODate, parseISODate, toISODate, today } from '../utils/date.js'

/** Dia em foco, guardado na URL (?d=YYYY-MM-DD) para poder recarregar e compartilhar. */
export function useFocusDate() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('d')

  const date = useMemo(() => (isISODate(raw) ? parseISODate(raw) : today()), [raw])

  const setDate = useCallback(
    (d) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('d', toISODate(d))
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return { date, setDate }
}
