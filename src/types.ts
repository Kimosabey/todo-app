export type Todo = {
  id: string
  title: string
  completed: boolean
  inProgress: boolean
  dueBy: string
  reportTo: string
  createdAt: number
  updatedAt: number
}

export type Filter = 'all' | 'active' | 'in_progress' | 'completed'

export type Theme = 'system' | 'light' | 'dark'
