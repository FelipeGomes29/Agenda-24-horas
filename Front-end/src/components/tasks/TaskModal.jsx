import { useEffect, useRef, useState } from 'react'
import { Trash2, X } from 'lucide-react'
import { CATEGORIES, DURATION_PRESETS, PRIORITIES } from '../../utils/categories.js'
import { formatDuration, isoDateOf, isoTimeOf } from '../../utils/date.js'

const field =
  'w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm placeholder:text-ink-soft focus:border-ink'
const label = 'mb-1.5 block text-sm font-medium'

export default function TaskModal({ task, defaults, onSave, onDelete, onClose }) {
  const editing = Boolean(task)
  const base = task ?? {
    title: '',
    notes: '',
    category: 'pessoal',
    priority: 'media',
    duration: 60,
    start: null,
    someday: false,
    done: false,
    ...defaults,
  }

  const [form, setForm] = useState(() => ({
    title: base.title,
    notes: base.notes,
    category: base.category,
    priority: base.priority,
    duration: base.duration,
    date: base.start ? isoDateOf(base.start) : '',
    time: base.start ? isoTimeOf(base.start) : '',
    someday: base.someday,
    done: base.done,
  }))
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const dialogRef = useRef(null)
  const downOnBackdrop = useRef(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  function changeDate(value) {
    setForm((f) => ({ ...f, date: value, time: value && !f.time ? '09:00' : f.time }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const title = form.title.trim()
    if (!title) return setError('Dê um título à tarefa.')
    const duration = Number(form.duration)
    if (!Number.isFinite(duration) || duration < 5 || duration > 1440) {
      return setError('A duração precisa ficar entre 5 minutos e 24 horas.')
    }
    if (form.time && !form.date) return setError('Escolha o dia do horário ou apague o horário.')

    const start = form.date ? `${form.date}T${form.time || '09:00'}` : null
    onSave({
      title,
      notes: form.notes.trim(),
      category: form.category,
      priority: form.priority,
      duration: Math.round(duration),
      start,
      someday: start ? false : form.someday,
      done: form.done,
    })
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onMouseDown={(e) => {
        downOnBackdrop.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (downOnBackdrop.current && e.target === e.currentTarget) onClose()
      }}
      aria-labelledby="task-modal-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/50"
    >
      <form onSubmit={handleSubmit} className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="task-modal-title" className="text-xl font-bold">
            {editing ? 'Editar tarefa' : 'Nova tarefa'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-sunken"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="t-title" className={label}>
              Título
            </label>
            <input
              id="t-title"
              value={form.title}
              onChange={(e) => {
                set('title', e.target.value)
                setError('')
              }}
              maxLength={120}
              autoFocus
              placeholder="Ex.: enviar relatório semanal"
              className={field}
            />
          </div>

          <div>
            <label htmlFor="t-notes" className={label}>
              Anotações
            </label>
            <textarea
              id="t-notes"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              maxLength={1000}
              rows={2}
              className={`${field} resize-y`}
            />
          </div>

          <fieldset>
            <legend className={label}>Categoria</legend>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={form.category === c.id}
                  onClick={() => set('category', c.id)}
                  className={`cat inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
                    form.category === c.id
                      ? 'border-primary bg-primary text-primary-ink'
                      : 'border-line hover:border-ink-soft'
                  }`}
                  style={{ '--h': c.hue, '--k': c.muted ? 0.12 : 1 }}
                >
                  <span className="cat-dot size-2 rounded-full" aria-hidden="true" />
                  {c.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className={label}>Prioridade</legend>
            <div className="inline-flex overflow-hidden rounded-lg border border-line">
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={form.priority === p.id}
                  onClick={() => set('priority', p.id)}
                  className={`px-4 py-1.5 text-sm ${
                    form.priority === p.id ? 'bg-primary text-primary-ink' : 'hover:bg-sunken'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="t-duration" className={label}>
              Duração (minutos)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                id="t-duration"
                type="number"
                min={5}
                max={1440}
                step={5}
                value={form.duration}
                onChange={(e) => set('duration', e.target.value)}
                className={`${field} !w-24`}
              />
              {DURATION_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set('duration', m)}
                  className={`rounded-md border px-2 py-1 text-xs ${
                    Number(form.duration) === m ? 'border-primary bg-primary text-primary-ink' : 'border-line hover:bg-sunken'
                  }`}
                >
                  {formatDuration(m)}
                </button>
              ))}
            </div>
          </div>

          <fieldset>
            <legend className={label}>Quando</legend>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                aria-label="Dia"
                value={form.date}
                onChange={(e) => changeDate(e.target.value)}
                className={`${field} !w-auto`}
              />
              <input
                type="time"
                aria-label="Horário de início"
                value={form.time}
                onChange={(e) => set('time', e.target.value)}
                className={`${field} !w-auto`}
              />
              {(form.date || form.time) && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, date: '', time: '' }))}
                  className="rounded-md px-2 py-1 text-sm text-ink-soft underline underline-offset-2 hover:text-ink"
                >
                  Devolver à caixa
                </button>
              )}
            </div>
            {!form.date && (
              <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={form.someday}
                  onChange={(e) => set('someday', e.target.checked)}
                  className="size-4 accent-[var(--ink)]"
                />
                Guardar como "algum dia"
              </label>
            )}
          </fieldset>

          {editing && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.done}
                onChange={(e) => set('done', e.target.checked)}
                className="size-4 accent-[var(--ink)]"
              />
              Tarefa concluída
            </label>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <div>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  if (!confirmDelete) return setConfirmDelete(true)
                  onDelete(task.id)
                  onClose()
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10"
              >
                <Trash2 size={16} aria-hidden="true" />
                {confirmDelete ? 'Confirmar exclusão' : 'Excluir tarefa'}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm hover:bg-sunken">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-ink">
              Salvar tarefa
            </button>
          </div>
        </div>
      </form>
    </dialog>
  )
}
