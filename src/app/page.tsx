import { readData } from '@/lib/data'
import { KanbanPageClient } from './KanbanPageClient'

export const dynamic = 'force-dynamic'

export default function KanbanPage() {
  const { items, projects } = readData()
  return <KanbanPageClient initialItems={items} initialProjects={projects} />
}
