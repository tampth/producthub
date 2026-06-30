import { NextResponse } from 'next/server'
import { getVaultInfo } from '@/lib/obsidian'

export async function GET() {
  return NextResponse.json(getVaultInfo())
}
