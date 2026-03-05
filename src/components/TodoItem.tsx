import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

import type { Todo } from '../types'
import { CheckIcon, ClockIcon, PencilIcon, TrashIcon, XIcon } from './Icons'

type Props = {
  todo: Todo
  onToggle: (id: string) => void
  onToggleInProgress: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, patch: Pick<Todo, 'title' | 'dueBy' | 'reportTo'>) => void
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function parseDueDate(dueBy: string) {
  if (!dueBy) return null

  const d = new Date(`${dueBy}T00:00:00`)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function formatDue(dueBy: string) {
  const d = parseDueDate(dueBy)
  if (!d) return '—'

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
  }).format(d)
}

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function TodoItem({ todo, onToggle, onToggleInProgress, onDelete, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(todo.title)
  const [draftDueBy, setDraftDueBy] = useState(todo.dueBy)
  const [draftReportTo, setDraftReportTo] = useState(todo.reportTo)
  const titleInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (isEditing) {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    }
  }, [isEditing])

  function startEditing() {
    setDraftTitle(todo.title)
    setDraftDueBy(todo.dueBy)
    setDraftReportTo(todo.reportTo)
    setIsEditing(true)
  }

  const meta = useMemo(() => {
    if (todo.updatedAt !== todo.createdAt) return `edited ${formatTime(todo.updatedAt)}`
    return `added ${formatTime(todo.createdAt)}`
  }, [todo.createdAt, todo.updatedAt])

  const dueText = useMemo(() => formatDue(todo.dueBy), [todo.dueBy])

  const dueTone = useMemo(() => {
    const d = parseDueDate(todo.dueBy)
    if (!d || todo.completed) return 'text-slate-600 dark:text-slate-300'

    if (d < startOfToday()) return 'text-rose-600 dark:text-rose-300'

    const inTwoDays = new Date(startOfToday().getTime() + 2 * 24 * 60 * 60 * 1000)
    if (d <= inTwoDays) return 'text-amber-700 dark:text-amber-200'

    return 'text-slate-600 dark:text-slate-300'
  }, [todo.completed, todo.dueBy])

  function commit() {
    const nextTitle = draftTitle.trim()
    if (!nextTitle) {
      setDraftTitle(todo.title)
      setDraftDueBy(todo.dueBy)
      setDraftReportTo(todo.reportTo)
      setIsEditing(false)
      return
    }

    const patch = {
      title: nextTitle,
      dueBy: draftDueBy,
      reportTo: draftReportTo.trim(),
    }

    if (patch.title !== todo.title || patch.dueBy !== todo.dueBy || patch.reportTo !== todo.reportTo) {
      onUpdate(todo.id, patch)
    }

    setIsEditing(false)
  }

  function cancel() {
    setDraftTitle(todo.title)
    setDraftDueBy(todo.dueBy)
    setDraftReportTo(todo.reportTo)
    setIsEditing(false)
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 520, damping: 42, mass: 0.9 }}
      className="group grid grid-cols-[auto,1fr] items-start gap-x-3 gap-y-2 px-4 py-3 sm:grid-cols-[auto,minmax(18rem,1fr),11rem,12rem,auto] sm:items-center"
    >
      <div className="mt-0.5 flex items-center gap-2 sm:mt-0">
        <button
          type="button"
          onClick={() => onToggle(todo.id)}
          className="grid h-6 w-6 place-items-center rounded-full border border-slate-300 bg-white shadow-sm transition hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-600"
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

        <button
          type="button"
          onClick={() => onToggleInProgress(todo.id)}
          className={
            todo.inProgress
              ? 'grid h-6 w-6 place-items-center rounded-full border border-amber-200 bg-amber-100 text-amber-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200'
              : 'grid h-6 w-6 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
          }
          aria-label={todo.inProgress ? 'Mark as not in progress' : 'Mark as in progress'}
        >
          <ClockIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="min-w-0">
        {isEditing ? (
          <>
            <input
              ref={titleInputRef}
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit()
                if (e.key === 'Escape') cancel()
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[15px] shadow-sm outline-none ring-indigo-500/20 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
              aria-label="Edit todo title"
              maxLength={200}
            />

            <div className="mt-2 grid gap-2 sm:hidden">
              <input
                type="date"
                value={draftDueBy}
                onChange={(e) => setDraftDueBy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commit()
                  if (e.key === 'Escape') cancel()
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/20 focus:border-indigo-300 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500"
                aria-label="Edit due date"
              />

              <input
                value={draftReportTo}
                onChange={(e) => setDraftReportTo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commit()
                  if (e.key === 'Escape') cancel()
                }}
                placeholder="Report to"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/20 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                aria-label="Edit report to"
                maxLength={60}
              />
            </div>
          </>
        ) : (
          <button type="button" className="w-full text-left" onDoubleClick={startEditing}>
            <div className="flex flex-wrap items-center gap-2">
              <p
                className={
                  todo.completed
                    ? 'text-[15px] leading-relaxed text-slate-500 line-through dark:text-slate-400'
                    : 'text-[15px] leading-relaxed text-slate-900 dark:text-slate-50'
                }
              >
                {todo.title}
              </p>
              {todo.inProgress && !todo.completed ? (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">
                  In progress
                </span>
              ) : null}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{meta}</span>
              <span className="sm:hidden">
                · <span className={dueTone}>{dueText}</span>
              </span>
              {todo.reportTo ? <span className="sm:hidden">· {todo.reportTo}</span> : null}
            </div>
          </button>
        )}
      </div>

      <div className="hidden sm:block">
        {isEditing ? (
          <input
            type="date"
            value={draftDueBy}
            onChange={(e) => setDraftDueBy(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') cancel()
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/20 focus:border-indigo-300 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500"
            aria-label="Edit due date"
          />
        ) : (
          <p className={`text-sm font-medium ${dueTone}`}>{dueText}</p>
        )}
      </div>

      <div className="hidden min-w-0 sm:block">
        {isEditing ? (
          <input
            value={draftReportTo}
            onChange={(e) => setDraftReportTo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') cancel()
            }}
            placeholder="Report to"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/20 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
            aria-label="Edit report to"
            maxLength={60}
          />
        ) : (
          <p className="truncate text-sm text-slate-600 dark:text-slate-300">{todo.reportTo || '—'}</p>
        )}
      </div>

      <div className="col-start-2 flex items-center justify-end gap-1 sm:col-auto">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={commit}
              className="inline-flex rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 sm:text-sm"
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancel}
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-200"
              aria-label="Cancel"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={startEditing}
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 opacity-100 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-200"
              aria-label="Edit"
            >
              <PencilIcon className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(todo.id)}
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 opacity-100 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
              aria-label="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </motion.li>
  )
}
