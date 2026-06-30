import { NextRequest, NextResponse } from 'next/server'
import { listItems, writeItem } from '@/lib/obsidian'
import { isGithubMode, ghListItems, ghWriteItem } from '@/lib/github'

export async function GET(
  _req: NextRequest,
  { params }: { params: { entity: string } }
) {
  try {
    const items = isGithubMode()
      ? await ghListItems(params.entity)
      : listItems(params.entity)
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
    if (isGithubMode()) {
      await ghWriteItem(params.entity, String(item.id), item)
    } else {
      writeItem(params.entity, String(item.id), item)
    }
    return NextResponse.json(item)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
