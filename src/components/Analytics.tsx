import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'

type Props = {
  isDark: boolean
}

const palette = {
  indigo: '#4f46e5',
  pink: '#ec4899',
  amber: '#f59e0b',
  emerald: '#10b981',
  sky: '#0ea5e9',
  slate: '#64748b',
}

function axis(isDark: boolean) {
  const label = isDark ? 'rgba(226,232,240,0.72)' : 'rgba(51,65,85,0.72)'
  const line = isDark ? 'rgba(148,163,184,0.22)' : 'rgba(100,116,139,0.22)'

  return {
    axisLine: { lineStyle: { color: line } },
    axisTick: { show: false },
    axisLabel: { color: label },
    splitLine: { lineStyle: { color: line } },
  }
}

function tooltip(isDark: boolean) {
  return {
    trigger: 'axis',
    backgroundColor: isDark ? 'rgba(2,6,23,0.92)' : 'rgba(255,255,255,0.96)',
    borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.22)',
    textStyle: { color: isDark ? 'rgba(226,232,240,0.92)' : 'rgba(15,23,42,0.92)' },
  }
}

export function Analytics({ isDark }: Props) {
  const text = isDark ? 'rgba(226,232,240,0.9)' : 'rgba(15,23,42,0.9)'

  const completedLast14 = useMemo(() => {
    const labels = Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i))
      return `${d.getMonth() + 1}/${d.getDate()}`
    })

    const values = [2, 3, 1, 4, 2, 3, 5, 4, 6, 5, 7, 6, 8, 7]

    return {
      labels,
      values,
    }
  }, [])

  const optionTrend = useMemo(() => {
    return {
      color: [palette.indigo],
      textStyle: { color: text },
      grid: { top: 24, left: 24, right: 18, bottom: 24, containLabel: true },
      tooltip: tooltip(isDark),
      xAxis: {
        type: 'category',
        data: completedLast14.labels,
        boundaryGap: false,
        ...axis(isDark),
      },
      yAxis: {
        type: 'value',
        ...axis(isDark),
      },
      series: [
        {
          name: 'Completed',
          type: 'line',
          data: completedLast14.values,
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          lineStyle: { width: 3 },
          areaStyle: { opacity: 0.12 },
          emphasis: { focus: 'series' },
        },
      ],
    }
  }, [completedLast14.labels, completedLast14.values, isDark, text])

  const optionStatus = useMemo(() => {
    const weeks = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4']

    return {
      color: [palette.slate, palette.amber, palette.indigo],
      textStyle: { color: text },
      tooltip: { ...tooltip(isDark), trigger: 'axis' },
      legend: {
        top: 0,
        textStyle: { color: isDark ? 'rgba(226,232,240,0.72)' : 'rgba(51,65,85,0.72)' },
      },
      grid: { top: 44, left: 24, right: 18, bottom: 24, containLabel: true },
      xAxis: { type: 'category', data: weeks, ...axis(isDark) },
      yAxis: { type: 'value', ...axis(isDark) },
      series: [
        { name: 'Active', type: 'bar', stack: 'total', data: [12, 10, 9, 11], barWidth: 18 },
        { name: 'In progress', type: 'bar', stack: 'total', data: [6, 7, 5, 8], barWidth: 18 },
        { name: 'Completed', type: 'bar', stack: 'total', data: [18, 20, 22, 19], barWidth: 18 },
      ],
    }
  }, [isDark, text])

  const optionOwners = useMemo(() => {
    return {
      color: [palette.indigo, palette.pink, palette.sky, palette.emerald, palette.amber],
      textStyle: { color: text },
      tooltip: {
        trigger: 'item',
        backgroundColor: isDark ? 'rgba(2,6,23,0.92)' : 'rgba(255,255,255,0.96)',
        borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.22)',
        textStyle: { color: isDark ? 'rgba(226,232,240,0.92)' : 'rgba(15,23,42,0.92)' },
      },
      legend: {
        bottom: 0,
        textStyle: { color: isDark ? 'rgba(226,232,240,0.72)' : 'rgba(51,65,85,0.72)' },
      },
      series: [
        {
          name: 'Report to',
          type: 'pie',
          radius: ['45%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 10, borderColor: 'transparent', borderWidth: 4 },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 700,
              color: text,
            },
          },
          labelLine: { show: false },
          data: [
            { value: 28, name: 'Design Lead' },
            { value: 22, name: 'Engineering Manager' },
            { value: 16, name: 'Product' },
            { value: 12, name: 'QA' },
            { value: 10, name: 'Self' },
          ],
        },
      ],
    }
  }, [isDark, text])

  const optionCalendar = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const hours = ['7a', '9a', '11a', '1p', '3p', '5p', '7p', '9p']

    const values: Array<[number, number, number]> = [
      [0, 0, 2],
      [0, 1, 3],
      [0, 2, 4],
      [0, 3, 6],
      [0, 4, 5],
      [0, 5, 3],
      [0, 6, 2],
      [0, 7, 1],
      [1, 0, 1],
      [1, 1, 2],
      [1, 2, 4],
      [1, 3, 5],
      [1, 4, 7],
      [1, 5, 4],
      [1, 6, 3],
      [1, 7, 2],
      [2, 0, 1],
      [2, 1, 3],
      [2, 2, 5],
      [2, 3, 7],
      [2, 4, 8],
      [2, 5, 6],
      [2, 6, 4],
      [2, 7, 2],
      [3, 0, 1],
      [3, 1, 2],
      [3, 2, 4],
      [3, 3, 5],
      [3, 4, 7],
      [3, 5, 6],
      [3, 6, 4],
      [3, 7, 2],
      [4, 0, 0],
      [4, 1, 1],
      [4, 2, 2],
      [4, 3, 3],
      [4, 4, 4],
      [4, 5, 3],
      [4, 6, 2],
      [4, 7, 1],
      [5, 0, 0],
      [5, 1, 1],
      [5, 2, 1],
      [5, 3, 2],
      [5, 4, 2],
      [5, 5, 1],
      [5, 6, 1],
      [5, 7, 0],
      [6, 0, 0],
      [6, 1, 0],
      [6, 2, 1],
      [6, 3, 1],
      [6, 4, 1],
      [6, 5, 1],
      [6, 6, 0],
      [6, 7, 0],
    ]

    const max = Math.max(...values.map((v) => v[2]))

    return {
      textStyle: { color: text },
      tooltip: {
        trigger: 'item',
        backgroundColor: isDark ? 'rgba(2,6,23,0.92)' : 'rgba(255,255,255,0.96)',
        borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.22)',
        textStyle: { color: isDark ? 'rgba(226,232,240,0.92)' : 'rgba(15,23,42,0.92)' },
        formatter: (params: { value: [number, number, number] }) => {
          const [d, h, v] = params.value
          return `${days[d]} · ${hours[h]}<br/>Touches: ${v}`
        },
      },
      grid: { top: 14, left: 56, right: 18, bottom: 44 },
      xAxis: {
        type: 'category',
        data: hours,
        splitArea: { show: true },
        axisLabel: { color: isDark ? 'rgba(226,232,240,0.72)' : 'rgba(51,65,85,0.72)' },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'category',
        data: days,
        splitArea: { show: true },
        axisLabel: { color: isDark ? 'rgba(226,232,240,0.72)' : 'rgba(51,65,85,0.72)' },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      visualMap: {
        min: 0,
        max,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        textStyle: { color: isDark ? 'rgba(226,232,240,0.62)' : 'rgba(51,65,85,0.62)' },
        inRange: {
          color: [isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.12)', palette.indigo],
        },
      },
      series: [
        {
          type: 'heatmap',
          data: values,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: isDark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.25)',
            },
          },
        },
      ],
    }
  }, [isDark, text])

  return (
    <div className="space-y-4 p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-soft backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Completed trend</h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Last 14 days · static sample</p>
            </div>
          </div>
          <div className="mt-3 h-56">
            <ReactECharts option={optionTrend} style={{ height: '100%', width: '100%' }} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-soft backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/40">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Workload by status</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Weeks · stacked bars</p>
          <div className="mt-3 h-56">
            <ReactECharts option={optionStatus} style={{ height: '100%', width: '100%' }} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-soft backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/40">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Report-to distribution</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Who tasks roll up to</p>
          <div className="mt-3 h-60">
            <ReactECharts option={optionOwners} style={{ height: '100%', width: '100%' }} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-soft backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/40">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Focus map</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Touches by weekday × time</p>
          <div className="mt-3 h-60">
            <ReactECharts option={optionCalendar} style={{ height: '100%', width: '100%' }} />
          </div>
        </section>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Note: charts are powered by ECharts and currently use static demo data. Next step can be to derive these metrics from your actual todo list.
      </p>
    </div>
  )
}
