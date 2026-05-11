import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData, nextProjectId } from '@/lib/data'

export async function GET() {
  const data = readData()
  return NextResponse.json(data.projects)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, color } = body as { name: string; color?: string }

  if (!name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const data = readData()
  const project = {
    id: nextProjectId(data.projects),
    name: name.trim(),
    color: color ?? '#6366f1',
    created_at: new Date().toISOString(),
  }
  data.projects.push(project)
  writeData(data)

  return NextResponse.json(project, { status: 201 })
}
