import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData, nextItemId } from '@/lib/data'
import type { Category, Priority, Size, Status } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('project_id')

  const data = readData()
  const items = projectId
    ? data.items.filter((i) => i.project_id === projectId)
    : data.items

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, project_id, category, priority, size, status, description } = body as {
    title: string
    project_id: string
    category: Category
    priority: Priority
    size?: Size
    status?: Status
    description?: string
  }

  if (!title?.trim() || !project_id || !category || !priority) {
    return NextResponse.json({ error: 'title, project_id, category and priority are required' }, { status: 400 })
  }

  const data = readData()
  const now = new Date().toISOString()
  const item = {
    id: nextItemId(data.items),
    title: title.trim(),
    description,
    project_id,
    category,
    status: (status ?? 'pending') as Status,
    priority,
    size,
    created_at: now,
    updated_at: now,
  }
  data.items.push(item)
  writeData(data)

  return NextResponse.json(item, { status: 201 })
}
