import type { Theme } from '../types'
import { MonitorIcon, MoonIcon, SunIcon } from './Icons'

type Props = {
  value: Theme
  onChange: (value: Theme) => void
}

const ORDER: Theme[] = ['system', 'light', 'dark']

export function ThemeToggle({ value, onChange }: Props) {
  const idx = ORDER.indexOf(value)
  const next = ORDER[(idx + 1) % ORDER.length]

  const label = value === 'system' ? 'System theme' : value === 'light' ? 'Light theme' : 'Dark theme'

  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-950"
      aria-label={`Theme: ${label}. Click to switch.`}
    >
      {value === 'system' ? <MonitorIcon className="h-4 w-4" /> : null}
      {value === 'light' ? <SunIcon className="h-4 w-4" /> : null}
      {value === 'dark' ? <MoonIcon className="h-4 w-4" /> : null}
      <span className="hidden sm:inline">{value}</span>
    </button>
  )
}
