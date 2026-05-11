'use client'

import { useState } from 'react'
import type { Project } from '@/lib/types'

const PROJECT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

interface Props {
  projects: Project[]
  activeId: string | null
  onChange: (id: string | null) => void
  onProjectCreated: (p: Project) => void
}

export function ProjectSelector({ projects, activeId, onChange, onProjectCreated }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const [saving, setSaving] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), color }),
    })
    const project: Project = await res.json()
    onProjectCreated(project)
    onChange(project.id)
    setName('')
    setColor(PROJECT_COLORS[0])
    setShowForm(false)
    setSaving(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onChange(null)}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          activeId === null ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        Todos
      </button>

      {projects.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            activeId === p.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          {p.name}
        </button>
      ))}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg border border-dashed border-white/10 px-3 py-1.5 text-xs text-gray-600 hover:border-white/20 hover:text-gray-400 transition-colors"
        >
          + Projeto
        </button>
      ) : (
        <form onSubmit={handleCreate} className="flex items-center gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do projeto"
            className="rounded-lg border border-white/10 bg-gray-900 px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
          />
          <div className="flex gap-1">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-5 w-5 rounded-full border-2 transition-all"
                style={{ backgroundColor: c, borderColor: color === c ? 'white' : 'transparent' }}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving ? '...' : 'Criar'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="text-gray-600 hover:text-gray-400 text-xs"
          >
            Cancelar
          </button>
        </form>
      )}
    </div>
  )
}
