export type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: number
  updatedAt: number
}

export type Filter = 'all' | 'active' | 'completed'

export type Theme = 'system' | 'light' | 'dark'
