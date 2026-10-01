import { useEffect, useState } from 'react'

/** Data/hora atual, atualizada a cada `intervalMs` (padrão: 30 s). */
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
