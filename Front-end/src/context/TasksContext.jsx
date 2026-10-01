import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '../api/tasks.js'

const TasksContext = createContext(null)

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    try {
      setTasks(await api.getTasks())
    } catch {
      setError('Não foi possível carregar as tarefas. Recarregue a página.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carga inicial: o setState acontece dentro do callback da promessa, não no corpo do efeito.
  useEffect(() => {
    let alive = true
    api
      .getTasks()
      .then((list) => alive && setTasks(list))
      .catch(() => alive && setError('Não foi possível carregar as tarefas. Recarregue a página.'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const addTask = useCallback(async (data) => {
    try {
      const created = await api.createTask(data)
      setTasks((prev) => [...prev, created])
      return created
    } catch {
      setError('Não foi possível criar a tarefa. Confira os campos e tente de novo.')
      return null
    }
  }, [])

  // Atualização otimista: a tela muda na hora e confirma com o resultado salvo.
  const updateTask = useCallback(
    async (id, patch) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
      try {
        const saved = await api.updateTask(id, patch)
        setTasks((prev) => prev.map((t) => (t.id === id ? saved : t)))
      } catch {
        setError('Não foi possível salvar a alteração. A tarefa voltou ao estado anterior.')
        reload()
      }
    },
    [reload],
  )

  const removeTask = useCallback(
    async (id) => {
      setTasks((prev) => prev.filter((t) => t.id !== id))
      try {
        await api.deleteTask(id)
      } catch {
        setError('Não foi possível excluir a tarefa.')
        reload()
      }
    },
    [reload],
  )

  const schedule = useCallback((id, start) => updateTask(id, { start, someday: false }), [updateTask])
  const unschedule = useCallback((id) => updateTask(id, { start: null }), [updateTask])
  const toggleDone = useCallback(
    (task) => updateTask(task.id, { done: !task.done }),
    [updateTask],
  )
  const clearError = useCallback(() => setError(null), [])

  const value = useMemo(
    () => ({
      tasks,
      loading,
      error,
      clearError,
      addTask,
      updateTask,
      removeTask,
      schedule,
      unschedule,
      toggleDone,
    }),
    [tasks, loading, error, clearError, addTask, updateTask, removeTask, schedule, unschedule, toggleDone],
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  const ctx = useContext(TasksContext)
  if (!ctx) throw new Error('useTasks precisa estar dentro de <TasksProvider>')
  return ctx
}
