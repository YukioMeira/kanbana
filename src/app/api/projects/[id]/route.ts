import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/data'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const data = readData()
  const idx = data.projects.findIndex((p) => p.id === params.id)

  if (idx === -1) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  data.projects[idx] = { ...data.projects[idx], ...body, id: params.id }
  writeData(data)

  return NextResponse.json(data.projects[idx])
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const data = readData()
  const idx = data.projects.findIndex((p) => p.id === params.id)

  if (idx === -1) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const [deleted] = data.projects.splice(idx, 1)
  // orphan items remain; callers should re-assign or delete them separately
  writeData(data)

  return NextResponse.json(deleted)
}
