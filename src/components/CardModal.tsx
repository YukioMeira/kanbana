'use client'

import { useEffect, useRef, useState } from 'react'
import type { Item, Project, Category, Priority, Size, Status } from '@/lib/types'

interface Props {
  projects: Project[]
  item?: Item | null
  defaultProjectId?: string
  onClose: () => void
  onSave: (payload: Partial<Item> & { title: string; project_id: string; category: Category; priority: Priority }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

const CATEGORIES: Category[] = ['feature', 'debt', 'bug', 'idea']
const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low']
const STATUSES: Status[] = ['pending', 'in_progress', 'done', 'on_hold']
const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL']

const CATEGORY_LABELS: Record<Category, string> = { feature: 'Feature', debt: 'Débito técnico', bug: 'Bug', idea: 'Ideia' }
const PRIORITY_LABELS: Record<Priority, string> = { critical: 'Crítica', high: 'Alta', medium: 'Média', low: 'Baixa' }
const STATUS_LABELS: Record<Status, string> = { pending: 'Pendente', in_progress: 'Em progresso', done: 'Concluído', on_hold: 'Em espera' }

export function CardModal({ projects, item, defaultProjectId, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [projectId, setProjectId] = useState(item?.project_id ?? defaultProjectId ?? projects[0]?.id ?? '')
  const [category, setCategory] = useState<Category>(item?.category ?? 'feature')
  const [priority, setPriority] = useState<Priority>(item?.priority ?? 'medium')
  const [status, setStatus] = useState<Status>(item?.status ?? 'pending')
  const [size, setSize] = useState<Size | ''>(item?.size ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => { titleRef.current?.focus() }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      project_id: projectId,
      category,
      priority,
      status,
      size: size || undefined,
    })
    setSaving(false)
    onClose()
  }

  const handleDelete = async () => {
    if (!item || !onDelete) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    await onDelete(item.id)
    setDeleting(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-gray-900 shadow-2xl">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-sm font-semibold text-white">{item ? 'Editar card' : 'Novo card'}</p>
          {item && <p className="text-xs text-gray-600 font-mono mt-0.5">{item.id}</p>}
        </div>

        <form onSubmit={handleSave} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">Título *</label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
              placeholder="O que precisa ser feito?"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none resize-none"
              placeholder="Contexto, critérios de aceite..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Projeto *</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Tamanho</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as Size | '')}
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="">—</option>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            {item && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                  confirmDelete
                    ? 'bg-red-500/30 text-red-300 hover:bg-red-500/40'
                    : 'text-red-500 hover:bg-red-500/10'
                }`}
              >
                {deleting ? 'Deletando...' : confirmDelete ? 'Confirmar exclusão' : 'Deletar'}
              </button>
            ) : <span />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : item ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
