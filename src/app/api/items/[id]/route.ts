import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/data'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const data = readData()
  const idx = data.items.findIndex((i) => i.id === params.id)

  if (idx === -1) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  data.items[idx] = {
    ...data.items[idx],
    ...body,
    id: params.id,
    updated_at: new Date().toISOString(),
  }
  writeData(data)

  return NextResponse.json(data.items[idx])
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const data = readData()
  const idx = data.items.findIndex((i) => i.id === params.id)

  if (idx === -1) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  const [deleted] = data.items.splice(idx, 1)
  writeData(data)

  return NextResponse.json(deleted)
}
