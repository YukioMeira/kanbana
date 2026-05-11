'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Item, Project, Status, Category, Priority } from '@/lib/types'
import { CardModal } from './CardModal'

// ─── Label / style maps ────────────────────────────────────────────────────

const STATUS_COLUMNS: { status: Status; label: string }[] = [
  { status: 'pending', label: 'Pendente' },
  { status: 'in_progress', label: 'Em progresso' },
  { status: 'done', label: 'Concluído' },
  { status: 'on_hold', label: 'Em espera' },
]

const CATEGORY_ICONS: Record<string, string> = { feature: '◆', debt: '⚙', bug: '●', idea: '◈' }
const CATEGORY_STYLES: Record<string, string> = {
  feature: 'text-indigo-400',
  debt: 'text-yellow-400',
  bug: 'text-red-400',
  idea: 'text-purple-400',
}
const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-red-900/60 text-red-300 border border-red-800',
  high: 'bg-orange-900/60 text-orange-300 border border-orange-800',
  medium: 'bg-yellow-900/60 text-yellow-300 border border-yellow-800',
  low: 'bg-green-900/60 text-green-300 border border-green-800',
}
const PRIORITY_LABELS: Record<string, string> = { critical: 'Crítica', high: 'Alta', medium: 'Média', low: 'Baixa' }

// ─── SortableCard ──────────────────────────────────────────────────────────

function SortableCard({ item, project, onClick }: { item: Item; project?: Project; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group rounded-lg border border-white/10 bg-gray-900 p-3 transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-40 shadow-2xl' : 'hover:border-white/20'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`text-xs shrink-0 ${CATEGORY_STYLES[item.category]}`}>{CATEGORY_ICONS[item.category]}</span>
            <span className="text-xs text-gray-600 font-mono">{item.id}</span>
          </div>
          <p className="text-sm text-gray-100 leading-snug">{item.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[item.priority]}`}>
              {PRIORITY_LABELS[item.priority]}
            </span>
            {item.size && (
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-gray-500 border border-white/10">
                {item.size}
              </span>
            )}
            {project && (
              <span
                className="rounded px-1.5 py-0.5 text-xs text-gray-500 border border-white/10"
                style={{ borderColor: project.color + '40', color: project.color }}
              >
                {project.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Column ────────────────────────────────────────────────────────────────

function Column({
  status,
  label,
  items,
  projects,
  projectMap,
  onCardClick,
  onAddClick,
}: {
  status: Status
  label: string
  items: Item[]
  projects: Project[]
  projectMap: Map<string, Project>
  onCardClick: (item: Item) => void
  onAddClick: (status: Status) => void
}) {
  const COLUMN_HEADER: Record<Status, string> = {
    pending: 'bg-gray-800 text-gray-400 border-gray-700',
    in_progress: 'bg-indigo-900/60 text-indigo-300 border-indigo-800',
    done: 'bg-green-900/60 text-green-300 border-green-800',
    on_hold: 'bg-yellow-900/40 text-yellow-400 border-yellow-900',
  }

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-white/10 bg-gray-950">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${COLUMN_HEADER[status]}`}>{label}</span>
          <span className="text-xs text-gray-600">{items.length}</span>
        </div>
        <button
          onClick={() => onAddClick(status)}
          className="rounded p-1 text-gray-600 hover:bg-white/5 hover:text-gray-300 transition-colors"
          title="Novo card"
        >
          +
        </button>
      </div>

      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-3 pt-0 min-h-[80px]">
          {items.map((item) => (
            <SortableCard
              key={item.id}
              item={item}
              project={projectMap.get(item.project_id)}
              onClick={() => onCardClick(item)}
            />
          ))}
          {items.length === 0 && (
            <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-white/5 text-xs text-gray-700">
              vazio
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

// ─── KanbanBoard ───────────────────────────────────────────────────────────

interface Props {
  initialItems: Item[]
  projects: Project[]
  activeProjectId: string | null
}

export function KanbanBoard({ initialItems, projects, activeProjectId }: Props) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [activeItem, setActiveItem] = useState<Item | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null | undefined>(undefined)
  const [newCardStatus, setNewCardStatus] = useState<Status | null>(null)

  const projectMap = new Map(projects.map((p) => [p.id, p]))

  const filteredItems = activeProjectId
    ? items.filter((i) => i.project_id === activeProjectId)
    : items

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const item = items.find((i) => i.id === event.active.id)
    setActiveItem(item ?? null)
  }, [items])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveItem(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const draggedItem = items.find((i) => i.id === active.id)
    if (!draggedItem) return

    // Determine target status: over could be a column id (Status) or another card id
    const targetStatus = STATUS_COLUMNS.find((c) => c.status === over.id)?.status
      ?? items.find((i) => i.id === over.id)?.status

    if (!targetStatus || targetStatus === draggedItem.status) return

    const now = new Date().toISOString()
    setItems((prev) =>
      prev.map((i) => i.id === draggedItem.id ? { ...i, status: targetStatus, updated_at: now } : i)
    )

    await fetch(`/api/items/${draggedItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: targetStatus }),
    })
  }, [items])

  const handleSave = async (payload: Partial<Item> & { title: string; project_id: string; category: Category; priority: Priority }) => {
    if (editingItem) {
      const res = await fetch(`/api/items/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const updated: Item = await res.json()
      setItems((prev) => prev.map((i) => i.id === updated.id ? updated : i))
    } else {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, status: newCardStatus ?? 'pending' }),
      })
      const created: Item = await res.json()
      setItems((prev) => [...prev, created])
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/items/${id}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6">
          {STATUS_COLUMNS.map(({ status, label }) => (
            <Column
              key={status}
              status={status}
              label={label}
              items={filteredItems.filter((i) => i.status === status)}
              projects={projects}
              projectMap={projectMap}
              onCardClick={(item) => setEditingItem(item)}
              onAddClick={(s) => { setNewCardStatus(s); setEditingItem(null) }}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem && (
            <div className="rounded-lg border border-indigo-500/40 bg-gray-900 p-3 shadow-2xl opacity-95 w-72">
              <p className="text-sm text-gray-100">{activeItem.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Create modal */}
      {editingItem === null && newCardStatus !== null && (
        <CardModal
          projects={projects}
          defaultProjectId={activeProjectId ?? projects[0]?.id}
          onClose={() => { setEditingItem(undefined); setNewCardStatus(null) }}
          onSave={handleSave}
        />
      )}

      {/* Edit modal */}
      {editingItem && (
        <CardModal
          projects={projects}
          item={editingItem}
          onClose={() => setEditingItem(undefined)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}
