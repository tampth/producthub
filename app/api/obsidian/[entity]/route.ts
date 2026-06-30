import { NextRequest, NextResponse } from 'next/server'
import { listItems, writeItem } from '@/lib/obsidian'

export async function GET(
  _req: NextRequest,
  { params }: { params: { entity: string } }
) {
  try {
    const items = listItems(params.entity)
    return NextResponse.json(items)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { entity: string } }
) {
  try {
    const item = await req.json()
    writeItem(params.entity, String(item.id), item)
    return NextResponse.json(item)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
