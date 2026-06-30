import { NextRequest, NextResponse } from 'next/server'
import { writeItem, deleteItem } from '@/lib/obsidian'

export async function PUT(
  req: NextRequest,
  { params }: { params: { entity: string; id: string } }
) {
  try {
    const item = await req.json()
    writeItem(params.entity, params.id, item)
    return NextResponse.json(item)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { entity: string; id: string } }
) {
  try {
    deleteItem(params.entity, params.id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
