'use client'

import { useState } from 'react'
import { LogView } from '@/components/LogView'
import { ProjectSelector } from '@/components/ProjectSelector'
import type { Item, Project } from '@/lib/types'

export function LogPageClient({ items, projects: initialProjects }: { items: Item[]; projects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-white">Log</h1>
        <ProjectSelector
          projects={projects}
          activeId={activeProjectId}
          onChange={setActiveProjectId}
          onProjectCreated={(p) => setProjects((prev) => [...prev, p])}
        />
      </div>

      <LogView items={items} projects={projects} activeProjectId={activeProjectId} />
    </div>
  )
}
