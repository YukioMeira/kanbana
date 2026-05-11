export type Category = 'feature' | 'debt' | 'bug' | 'idea'
export type Status = 'pending' | 'in_progress' | 'done' | 'on_hold'
export type Priority = 'critical' | 'high' | 'medium' | 'low'
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL'

export interface Project {
  id: string
  name: string
  color: string
  created_at: string
}

export interface Item {
  id: string
  title: string
  description?: string
  project_id: string
  category: Category
  status: Status
  priority: Priority
  size?: Size
  created_at: string
  updated_at: string
}

export interface KanbanaData {
  projects: Project[]
  items: Item[]
}
