'use client'

import { useState } from 'react'
import { KanbanBoard } from '@/components/KanbanBoard'
import { ProjectSelector } from '@/components/ProjectSelector'
import type { Item, Project } from '@/lib/types'

export function KanbanPageClient({
  initialItems,
  initialProjects,
}: {
  initialItems: Item[]
  initialProjects: Project[]
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-white">Kanban</h1>
        <ProjectSelector
          projects={projects}
          activeId={activeProjectId}
          onChange={setActiveProjectId}
          onProjectCreated={(p) => setProjects((prev) => [...prev, p])}
        />
      </div>

      <KanbanBoard
        initialItems={initialItems}
        projects={projects}
        activeProjectId={activeProjectId}
      />
    </div>
  )
}
