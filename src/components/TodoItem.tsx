import { useEffect, useMemo, useRef, useState } from 'react'

import type { Todo } from '../types'
import { CheckIcon, PencilIcon, TrashIcon } from './Icons'

type Props = {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdateTitle: (id: string, title: string) => void
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

export function TodoItem({ todo, onToggle, onDelete, onUpdateTitle }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  function startEditing() {
    setDraft(todo.title)
    setIsEditing(true)
  }

  const meta = useMemo(() => {
    if (todo.updatedAt !== todo.createdAt) return `edited ${formatTime(todo.updatedAt)}`
    return `added ${formatTime(todo.createdAt)}`
  }, [todo.createdAt, todo.updatedAt])

  function commit() {
    const next = draft.trim()
    if (next.length === 0) {
      setDraft(todo.title)
      setIsEditing(false)
      return
    }

    if (next !== todo.title) onUpdateTitle(todo.id, next)
    setIsEditing(false)
  }

  function cancel() {
    setDraft(todo.title)
    setIsEditing(false)
  }

  return (
    <li className="group flex items-start gap-3 px-4 py-3">
      <button
        type="button"
        onClick={() => onToggle(todo.id)}
        className="mt-0.5 grid h-6 w-6 place-items-center rounded-full border border-slate-300 bg-white shadow-sm transition hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-600"
        aria-label={todo.completed ? 'Mark as not completed' : 'Mark as completed'}
      >
        <span
          className={
            todo.completed
              ? 'grid h-6 w-6 place-items-center rounded-full bg-indigo-600 text-white'
              : 'grid h-6 w-6 place-items-center rounded-full'
          }
        >
          {todo.completed ? <CheckIcon className="h-4 w-4" /> : null}
        </span>
      </button>

      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') cancel()
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[15px] shadow-sm outline-none ring-indigo-500/20 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
            aria-label="Edit todo"
          />
        ) : (
          <button
            type="button"
            className="w-full text-left"
            onDoubleClick={startEditing}
          >
            <p
              className={
                todo.completed
                  ? 'text-[15px] leading-relaxed text-slate-500 line-through dark:text-slate-400'
                  : 'text-[15px] leading-relaxed text-slate-900 dark:text-slate-50'
              }
            >
              {todo.title}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{meta}</p>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
        {!isEditing ? (
          <button
            type="button"
            onClick={startEditing}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-200"
            aria-label="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => onDelete(todo.id)}
          className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
          aria-label="Delete"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </li>
  )
}
