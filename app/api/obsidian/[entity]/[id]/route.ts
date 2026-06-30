import { NextRequest, NextResponse } from 'next/server'
import { writeItem, deleteItem } from '@/lib/obsidian'
import { isGithubMode, ghWriteItem, ghDeleteItem } from '@/lib/github'

export async function PUT(
  req: NextRequest,
  { params }: { params: { entity: string; id: string } }
) {
  try {
    const item = await req.json()
    if (isGithubMode()) {
      await ghWriteItem(params.entity, params.id, item)
    } else {
      writeItem(params.entity, params.id, item)
    }
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
    if (isGithubMode()) {
      await ghDeleteItem(params.entity, params.id)
    } else {
      deleteItem(params.entity, params.id)
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
