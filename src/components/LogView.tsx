'use client'

import { useState } from 'react'
import type { Item, Project, Category, Priority, Status } from '@/lib/types'

type TimeFilter = '7d' | '30d' | 'all'
type SortField = 'recent' | 'oldest' | 'priority' | 'status'

// ─── Label / style maps ────────────────────────────────────────────────────

const STATUS_LABELS: Record<Status, string> = {
  pending: 'Pendente',
  in_progress: 'Em progresso',
  done: 'Concluído',
  on_hold: 'Em espera',
}
const STATUS_STYLES: Record<Status, string> = {
  pending: 'bg-gray-800 text-gray-400 border border-gray-700',
  in_progress: 'bg-indigo-900/60 text-indigo-300 border border-indigo-800',
  done: 'bg-green-900/60 text-green-300 border border-green-800',
  on_hold: 'bg-yellow-900/40 text-yellow-400 border border-yellow-900',
}
const CATEGORY_ICONS: Record<Category, string> = { feature: '◆', debt: '⚙', bug: '●', idea: '◈' }
const CATEGORY_STYLES: Record<Category, string> = {
  feature: 'text-indigo-400',
  debt: 'text-yellow-400',
  bug: 'text-red-400',
  idea: 'text-purple-400',
}
const PRIORITY_STYLES: Record<Priority, string> = {
  critical: 'bg-red-900/60 text-red-300 border border-red-800',
  high: 'bg-orange-900/60 text-orange-300 border border-orange-800',
  medium: 'bg-yellow-900/60 text-yellow-300 border border-yellow-800',
  low: 'bg-green-900/60 text-green-300 border border-green-800',
}
const PRIORITY_LABELS: Record<Priority, string> = { critical: 'Crítica', high: 'Alta', medium: 'Média', low: 'Baixa' }
const PRIORITY_ORDER: Priority[] = ['critical', 'high', 'medium', 'low']
const STATUS_ORDER: Status[] = ['in_progress', 'pending', 'on_hold', 'done']

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

function formatDateHeader(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Hoje'
  if (date.toDateString() === yesterday.toDateString()) return 'Ontem'
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}

function getEventLabel(item: Item): { label: string; style: string } {
  const created = item.created_at ? new Date(item.created_at).getTime() : 0
  const updated = item.updated_at ? new Date(item.updated_at).getTime() : 0

  if (updated - created > 1000) {
    if (item.status === 'done') return { label: 'Concluído', style: 'text-green-400' }
    if (item.status === 'on_hold') return { label: 'Pausado', style: 'text-yellow-400' }
    if (item.status === 'in_progress') return { label: 'Iniciado', style: 'text-indigo-400' }
    return { label: 'Atualizado', style: 'text-blue-400' }
  }
  return { label: 'Criado', style: 'text-gray-400' }
}

function filterByTime(items: Item[], filter: TimeFilter): Item[] {
  if (filter === 'all') return items
  const cutoff = Date.now() - (filter === '7d' ? 7 : 30) * 24 * 60 * 60 * 1000
  return items.filter((i) => new Date(i.updated_at).getTime() >= cutoff)
}

function applySort(items: Item[], sort: SortField): Item[] {
  const copy = [...items]
  if (sort === 'recent') return copy.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  if (sort === 'oldest') return copy.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
  if (sort === 'priority') return copy.sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority))
  if (sort === 'status') return copy.sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
  return copy
}

function groupByDate(items: Item[]): [string, Item[]][] {
  const groups = new Map<string, Item[]>()
  for (const item of items) {
    const key = new Date(item.updated_at).toDateString()
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(item)
  }
  return Array.from(groups.entries())
}

function groupByPriority(items: Item[]): [string, Item[]][] {
  const map = new Map<Priority, Item[]>(PRIORITY_ORDER.map((p) => [p, []]))
  for (const item of items) map.get(item.priority)!.push(item)
  return PRIORITY_ORDER.filter((p) => map.get(p)!.length > 0).map((p) => [PRIORITY_LABELS[p], map.get(p)!])
}

function groupByStatus(items: Item[]): [string, Item[]][] {
  const map = new Map<Status, Item[]>(STATUS_ORDER.map((s) => [s, []]))
  for (const item of items) map.get(item.status)!.push(item)
  return STATUS_ORDER.filter((s) => map.get(s)!.length > 0).map((s) => [STATUS_LABELS[s], map.get(s)!])
}

function buildGroups(items: Item[], sort: SortField): [string, Item[]][] {
  if (sort === 'priority') return groupByPriority(items)
  if (sort === 'status') return groupByStatus(items)
  return groupByDate(items)
}

function groupHeaderLabel(key: string, sort: SortField, items: Item[]): string {
  if (sort === 'recent' || sort === 'oldest') {
    const ref = items[0]?.updated_at
    return ref ? formatDateHeader(ref) : key
  }
  return key
}

// ─── Component ────────────────────────────────────────────────────────────

interface Props {
  items: Item[]
  projects: Project[]
  activeProjectId: string | null
}

export function LogView({ items: allItems, projects, activeProjectId }: Props) {
  const [filter, setFilter] = useState<TimeFilter>('7d')
  const [sort, setSort] = useState<SortField>('recent')

  const projectMap = new Map(projects.map((p) => [p.id, p]))

  const scoped = activeProjectId ? allItems.filter((i) => i.project_id === activeProjectId) : allItems
  const withTs = scoped.filter((i) => i.updated_at)
  const filtered = filterByTime(withTs, filter)
  const sorted = applySort(filtered, sort)
  const groups = buildGroups(sorted, sort)

  const timeLabels: Record<TimeFilter, string> = { '7d': '7 dias', '30d': '30 dias', all: 'Tudo' }
  const sortLabels: Record<SortField, string> = { recent: '↓ Recente', oldest: '↑ Antigo', priority: 'Prioridade', status: 'Status' }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {sorted.length} {sorted.length === 1 ? 'alteração' : 'alterações'}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-gray-800 bg-gray-900 p-1">
            {(['7d', '30d', 'all'] as TimeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${filter === f ? 'bg-gray-700 text-gray-100' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {timeLabels[f]}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-lg border border-gray-800 bg-gray-900 p-1">
            {(['recent', 'oldest', 'priority', 'status'] as SortField[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${sort === s ? 'bg-gray-700 text-gray-100' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {sortLabels[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-2xl mb-3">📋</p>
          <p className="text-gray-400 font-medium">Nenhuma alteração no período</p>
          <p className="text-gray-600 text-sm mt-1">Alterações feitas a partir de agora aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(([groupKey, groupItems]) => (
            <div key={groupKey}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500 capitalize">
                {groupHeaderLabel(groupKey, sort, groupItems)}
                <span className="ml-2 normal-case text-gray-700 font-normal tracking-normal">{groupItems.length}</span>
              </p>
              <div className="space-y-2">
                {groupItems.map((item) => {
                  const event = getEventLabel(item)
                  const project = projectMap.get(item.project_id)
                  return (
                    <div
                      key={item.id + item.updated_at}
                      className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 hover:border-gray-700 transition-colors"
                    >
                      <span className={`mt-0.5 text-sm shrink-0 ${CATEGORY_STYLES[item.category]}`} title={item.category}>
                        {CATEGORY_ICONS[item.category]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-600 font-mono shrink-0">{item.id}</span>
                          <span className="text-sm text-gray-100 truncate">{item.title}</span>
                        </div>
                        {project && (
                          <p className="mt-0.5 text-xs truncate" style={{ color: project.color }}>
                            {project.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[item.priority]}`}>
                          {PRIORITY_LABELS[item.priority]}
                        </span>
                        <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_STYLES[item.status]}`}>
                          {STATUS_LABELS[item.status]}
                        </span>
                        <span className={`text-xs font-medium ${event.style}`}>{event.label}</span>
                        <span className="text-xs text-gray-600 tabular-nums">{formatTime(item.updated_at)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
