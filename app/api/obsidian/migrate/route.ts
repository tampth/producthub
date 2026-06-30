import { NextRequest, NextResponse } from 'next/server'
import { writeItem } from '@/lib/obsidian'

export async function POST(req: NextRequest) {
  try {
    const data: Record<string, unknown[]> = await req.json()
    const results: Record<string, number> = {}

    for (const [entity, items] of Object.entries(data)) {
      if (!Array.isArray(items)) continue
      let count = 0
      for (const item of items as Record<string, unknown>[]) {
        if (item.id != null) {
          writeItem(entity, String(item.id), item)
          count++
        }
      }
      results[entity] = count
    }

    return NextResponse.json({ ok: true, results })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
