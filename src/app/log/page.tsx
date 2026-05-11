import { readData } from '@/lib/data'
import { LogPageClient } from './LogPageClient'

export const dynamic = 'force-dynamic'

export default function LogPage() {
  const { items, projects } = readData()
  return <LogPageClient items={items} projects={projects} />
}
