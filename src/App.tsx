import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { PlusIcon } from './components/Icons'
import { ThemeToggle } from './components/ThemeToggle'
import { TodoItem } from './components/TodoItem'
import { uid } from './lib/uid'
import { useLocalStorageState } from './lib/useLocalStorageState'
import type { Filter, Theme, Todo } from './types'


const AnalyticsView = lazy(() =>
  import('./components/Analytics').then((m) => ({
    default: m.Analytics,
  })),
)

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp))
}

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
]

const APP_STARTED_AT = Date.now()


export default function App() {
  const [theme, setTheme] = useLocalStorageState<Theme>('todo.theme', 'system')
  const [view, setView] = useLocalStorageState<'todos' | 'analytics'>('todo.view', 'todos')
  const [filter, setFilter] = useLocalStorageState<Filter>('todo.filter', 'all')
  const [todos, setTodos] = useLocalStorageState<Todo[]>('todo.todos', [])

  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [draftDueBy, setDraftDueBy] = useState('')
  const [draftReportTo, setDraftReportTo] = useState('')
  const [isDark, setIsDark] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const safeTheme: Theme = theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'system'
  const safeFilter: Filter =
    filter === 'all' || filter === 'active' || filter === 'in_progress' || filter === 'completed'
      ? filter
      : 'all'

  const safeView: 'todos' | 'analytics' = view === 'analytics' || view === 'todos' ? view : 'todos'


  useEffect(() => {
    if (theme !== safeTheme) setTheme(safeTheme)
  }, [safeTheme, setTheme, theme])

  useEffect(() => {
    if (filter !== safeFilter) setFilter(safeFilter)
  }, [filter, safeFilter, setFilter])


  useEffect(() => {
    if (view !== safeView) setView(safeView)
  }, [safeView, setView, view])

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const nextIsDark = safeTheme === 'dark' || (safeTheme === 'system' && media.matches)
      root.classList.toggle('dark', nextIsDark)
      setIsDark(nextIsDark)
    }

    apply()

    if (safeTheme !== 'system') return

    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [safeTheme])

  useEffect(() => {
    let changed = false

    const normalized = todos.map((t) => {
      const anyT = t as unknown as Record<string, unknown>

      const title = typeof anyT.title === 'string' ? (anyT.title as string) : ''
      const completed = Boolean(anyT.completed)
      const inProgress = Boolean(anyT.inProgress)
      const dueBy = typeof anyT.dueBy === 'string' ? (anyT.dueBy as string) : ''
      const reportTo = typeof anyT.reportTo === 'string' ? (anyT.reportTo as string) : ''

      const next: Todo = {
        ...t,
        title,
        completed,
        inProgress,
        dueBy,
        reportTo,
      }

      if (
        next.title !== t.title ||
        next.completed !== t.completed ||
        next.inProgress !== t.inProgress ||
        next.dueBy !== t.dueBy ||
        next.reportTo !== t.reportTo
      ) {
        changed = true
      }

      return next
    })

    if (changed) setTodos(normalized)
  }, [setTodos, todos])


  const stats = useMemo(() => {
    const completed = todos.filter((t) => t.completed).length
    const remaining = todos.length - completed
    return { completed, remaining, total: todos.length }
  }, [todos])

  const visibleTodos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return todos
      .filter((t) => {
        if (safeFilter === 'active') return !t.completed && !t.inProgress
        if (safeFilter === 'in_progress') return !!t.inProgress && !t.completed
        if (safeFilter === 'completed') return !!t.completed
        return true
      })
      .filter((t) =>
        normalizedQuery.length
          ? `${t.title} ${t.reportTo}`.toLowerCase().includes(normalizedQuery)
          : true,
      )
  }, [query, safeFilter, todos])

  const allCompleted = stats.total > 0 && stats.remaining === 0

  function addTodo(title: string, dueBy: string, reportTo: string) {
    const trimmed = title.trim()
    if (!trimmed) return

    const now = Date.now()
    const next: Todo = {
      id: uid(),
      title: trimmed,
      completed: false,
      inProgress: false,
      dueBy,
      reportTo: reportTo.trim(),
      createdAt: now,
      updatedAt: now,
    }

    setTodos((prev) => [next, ...prev])
  }

  function updateTodo(id: string, updater: (todo: Todo) => Todo) {
    setTodos((prev) => prev.map((t) => (t.id === id ? updater(t) : t)))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-full bg-[radial-gradient(70%_60%_at_20%_0%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(50%_40%_at_100%_20%,rgba(236,72,153,0.12),transparent_60%)] px-4 py-10 dark:bg-[radial-gradient(70%_60%_at_20%_0%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(50%_40%_at_100%_20%,rgba(236,72,153,0.08),transparent_60%)] sm:py-14"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Todo, beautifully.
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {formatDate(APP_STARTED_AT)} ·{' '}
              {safeView === 'todos' ? (
                <>{stats.remaining} remaining</>
              ) : (
                <>Analytics overview</>
              )}
            </p>
          </div>

          <ThemeToggle value={safeTheme} onChange={setTheme} />
        </motion.header>

        <motion.main
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.05 }}
          className="mt-6 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 shadow-soft backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/50"
        >
          <div className="flex flex-col gap-3 border-b border-slate-200/70 p-4 dark:border-slate-800/60 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="inline-flex rounded-2xl border border-slate-200 bg-white/70 p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
              {(['todos', 'analytics'] as const).map((k) => {
                const active = k === safeView
                const label = k === 'todos' ? 'Todos' : 'Analytics'
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setView(k)}
                    className={
                      active
                        ? 'rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm dark:bg-white dark:text-slate-900'
                        : 'rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white dark:text-slate-200 dark:hover:bg-slate-950'
                    }
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {safeView === 'todos' ? 'Organize your day.' : 'Static demo charts (ECharts).'}
            </p>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {safeView === 'todos' ? (
              <motion.div
                key="todos"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <div className="space-y-4 p-4 sm:p-5">
            <form
              className="grid gap-3 sm:grid-cols-[minmax(18rem,1fr),11rem,12rem,auto]"
              onSubmit={(e) => {
                e.preventDefault()
                addTodo(draft, draftDueBy, draftReportTo)
                setDraft('')
                setDraftDueBy('')
                setDraftReportTo('')
                inputRef.current?.focus()
              }}
            >
              <div>
                <label htmlFor="new-todo" className="sr-only">
                  Add a todo
                </label>
                <input
                  id="new-todo"
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Task"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] shadow-sm outline-none ring-indigo-500/20 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                  autoComplete="off"
                  maxLength={200}
                />
              </div>

              <div>
                <label htmlFor="due-by" className="sr-only">
                  To be completed by
                </label>
                <input
                  id="due-by"
                  type="date"
                  value={draftDueBy}
                  onChange={(e) => setDraftDueBy(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm shadow-sm outline-none ring-indigo-500/20 focus:border-indigo-300 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="report-to" className="sr-only">
                  Report to
                </label>
                <input
                  id="report-to"
                  value={draftReportTo}
                  onChange={(e) => setDraftReportTo(e.target.value)}
                  placeholder="Report to"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm shadow-sm outline-none ring-indigo-500/20 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                  maxLength={60}
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!draft.trim().length}
              >
                <PlusIcon className="h-4 w-4" />
                Add
              </button>
            </form>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {FILTERS.map(({ key, label }) => {
                  const active = key === safeFilter
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFilter(key)}
                      className={
                        active
                          ? 'rounded-2xl bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white shadow-sm dark:bg-white dark:text-slate-900'
                          : 'rounded-2xl border border-slate-200 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-950'
                      }
                    >
                      {label}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <input
                  id="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/20 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 dark:border-slate-800 dark:bg-slate-950/40 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 sm:w-48"
                  maxLength={200}
                />

                <button
                  type="button"
                  onClick={() => {
                    setTodos((prev) =>
                      prev.map((t) => ({
                        ...t,
                        completed: !allCompleted,
                        inProgress: false,
                        updatedAt: Date.now(),
                      }))
                    )
                  }}
                  className="hidden rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-950 sm:inline-flex"
                  disabled={stats.total === 0}
                >
                  {allCompleted ? 'Uncheck all' : 'Check all'}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/70 dark:border-slate-800/60">
            {visibleTodos.length ? (
              <>
                <div className="hidden grid-cols-[auto,minmax(18rem,1fr),11rem,12rem,auto] items-center gap-x-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:grid">
                  <div className="w-[3.5rem]" />
                  <div>Task</div>
                  <div>To be completed by</div>
                  <div>Report to</div>
                  <div className="text-right">Actions</div>
                </div>

                <ul className="max-h-[55vh] divide-y divide-slate-200/70 overflow-auto no-scrollbar dark:divide-slate-800/60">
                  <AnimatePresence initial={false}>
                    {visibleTodos.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={(id) =>
                          updateTodo(id, (t) => ({
                            ...t,
                            completed: !t.completed,
                            inProgress: false,
                            updatedAt: Date.now(),
                          }))
                        }
                        onToggleInProgress={(id) =>
                          updateTodo(id, (t) => ({
                            ...t,
                            inProgress: !t.inProgress,
                            completed: false,
                            updatedAt: Date.now(),
                          }))
                        }
                        onDelete={(id) => setTodos((prev) => prev.filter((t) => t.id !== id))}
                        onUpdate={(id, patch) =>
                          updateTodo(id, (t) => ({
                            ...t,
                            ...patch,
                            updatedAt: Date.now(),
                          }))
                        }
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="grid place-items-center px-6 py-14 text-center"
              >
                <div className="max-w-sm">
                  <p className="text-base font-semibold text-slate-900 dark:text-white">Nothing here yet.</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Add a task above, or adjust your filters.
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200/70 p-4 text-sm text-slate-600 dark:border-slate-800/60 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <p>
              <span className="font-semibold text-slate-900 dark:text-white">{stats.remaining}</span> left ·{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{stats.completed}</span> done
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTodos((prev) => prev.filter((t) => !t.completed))
                }}
                className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-950"
                disabled={stats.completed === 0}
              >
                Clear completed
              </button>

              <button
                type="button"
                onClick={() => {
                  setTodos([])
                  setQuery('')
                  setDraft('')
                  setDraftDueBy('')
                  setDraftReportTo('')
                  inputRef.current?.focus()
                }}
                className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-950"
                disabled={stats.total === 0}
              >
                Reset
              </button>
            </div>
          </div>
              </motion.div>
            ) : (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Suspense
                  fallback={
                    <div className="p-4 text-sm text-slate-600 dark:text-slate-300 sm:p-5">
                      Loading analytics…
                    </div>
                  }
                >
                  <AnalyticsView isDark={isDark} />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>

        <footer className="mt-6 text-xs text-slate-500 dark:text-slate-400">
          {safeView === 'todos' ? (
            <>
              Tip: Press <span className="font-semibold text-slate-700 dark:text-slate-200">Enter</span> to
              add. Double-click a task to edit. Use the clock to mark “In progress”.
            </>
          ) : (
            <>Tip: These charts use static demo data (for now).</>
          )}
        </footer>
      </div>
    </motion.div>
  )
}
