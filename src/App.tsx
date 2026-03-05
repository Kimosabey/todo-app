import { useEffect, useMemo, useRef, useState } from 'react'

import { PlusIcon } from './components/Icons'
import { ThemeToggle } from './components/ThemeToggle'
import { TodoItem } from './components/TodoItem'
import { uid } from './lib/uid'
import { useLocalStorageState } from './lib/useLocalStorageState'
import type { Filter, Theme, Todo } from './types'

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
  { key: 'completed', label: 'Completed' },
]

const APP_STARTED_AT = Date.now()


export default function App() {
  const [theme, setTheme] = useLocalStorageState<Theme>('todo.theme', 'system')
  const [filter, setFilter] = useLocalStorageState<Filter>('todo.filter', 'all')
  const [todos, setTodos] = useLocalStorageState<Todo[]>('todo.todos', [])

  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  const safeTheme: Theme = theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'system'
  const safeFilter: Filter =
    filter === 'all' || filter === 'active' || filter === 'completed' ? filter : 'all'

  useEffect(() => {
    if (theme !== safeTheme) setTheme(safeTheme)
  }, [safeTheme, setTheme, theme])

  useEffect(() => {
    if (filter !== safeFilter) setFilter(safeFilter)
  }, [filter, safeFilter, setFilter])

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const isDark = safeTheme === 'dark' || (safeTheme === 'system' && media.matches)
      root.classList.toggle('dark', isDark)
    }

    apply()

    if (safeTheme !== 'system') return

    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [safeTheme])

  const stats = useMemo(() => {
    const completed = todos.filter((t) => t.completed).length
    const remaining = todos.length - completed
    return { completed, remaining, total: todos.length }
  }, [todos])

  const visibleTodos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return todos
      .filter((t) => {
        if (safeFilter === 'active') return !t.completed
        if (safeFilter === 'completed') return t.completed
        return true
      })
      .filter((t) => (normalizedQuery.length ? t.title.toLowerCase().includes(normalizedQuery) : true))
  }, [query, safeFilter, todos])

  const allCompleted = stats.total > 0 && stats.remaining === 0

  function addTodo(title: string) {
    const trimmed = title.trim()
    if (!trimmed) return

    const now = Date.now()
    const next: Todo = {
      id: uid(),
      title: trimmed,
      completed: false,
      createdAt: now,
      updatedAt: now,
    }

    setTodos((prev) => [next, ...prev])
  }

  function updateTodo(id: string, updater: (todo: Todo) => Todo) {
    setTodos((prev) => prev.map((t) => (t.id === id ? updater(t) : t)))
  }

  return (
    <div className="min-h-full bg-[radial-gradient(70%_60%_at_20%_0%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(50%_40%_at_100%_20%,rgba(236,72,153,0.12),transparent_60%)] px-4 py-10 dark:bg-[radial-gradient(70%_60%_at_20%_0%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(50%_40%_at_100%_20%,rgba(236,72,153,0.08),transparent_60%)] sm:py-14">
      <div className="mx-auto flex w-full max-w-2xl flex-col">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Todo, beautifully.
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {formatDate(APP_STARTED_AT)} · {stats.remaining} remaining
            </p>
          </div>

          <ThemeToggle value={safeTheme} onChange={setTheme} />
        </header>

        <main className="mt-6 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 shadow-soft backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/50">
          <div className="space-y-4 p-4 sm:p-5">
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                addTodo(draft)
                setDraft('')
                inputRef.current?.focus()
              }}
            >
              <div className="flex-1">
                <label htmlFor="new-todo" className="sr-only">
                  Add a todo
                </label>
                <input
                  id="new-todo"
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="What would you like to get done?"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] shadow-sm outline-none ring-indigo-500/20 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                  autoComplete="off"
                  maxLength={200}
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
                    setTodos((prev) => prev.map((t) => ({ ...t, completed: !allCompleted, updatedAt: Date.now() })))
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
              <ul className="max-h-[55vh] divide-y divide-slate-200/70 overflow-auto no-scrollbar dark:divide-slate-800/60">
                {visibleTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={(id) =>
                      updateTodo(id, (t) => ({ ...t, completed: !t.completed, updatedAt: Date.now() }))
                    }
                    onDelete={(id) => setTodos((prev) => prev.filter((t) => t.id !== id))}
                    onUpdateTitle={(id, title) =>
                      updateTodo(id, (t) => ({ ...t, title, updatedAt: Date.now() }))
                    }
                  />
                ))}
              </ul>
            ) : (
              <div className="grid place-items-center px-6 py-14 text-center">
                <div className="max-w-sm">
                  <p className="text-base font-semibold text-slate-900 dark:text-white">Nothing here yet.</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Add a task above, or adjust your filters.
                  </p>
                </div>
              </div>
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
                  inputRef.current?.focus()
                }}
                className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-950"
                disabled={stats.total === 0}
              >
                Reset
              </button>
            </div>
          </div>
        </main>

        <footer className="mt-6 text-xs text-slate-500 dark:text-slate-400">
          Tip: Press <span className="font-semibold text-slate-700 dark:text-slate-200">Enter</span> to add. Double-click a task to edit.
        </footer>
      </div>
    </div>
  )
}
