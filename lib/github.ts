import matter from 'gray-matter'

const TOKEN = process.env.GITHUB_TOKEN?.replace(/^﻿/, '').trim()
const OWNER = process.env.GITHUB_OWNER ?? 'tampth'
const REPO = process.env.GITHUB_REPO ?? 'producthub'
const VAULT_PATH = 'vault/ProductHUB'

const BODY_FIELD: Record<string, string> = {
  ideas: 'description',
  bugs: 'description',
  backlog: 'description',
  requirements: 'description',
  decisions: '',
  news: 'content',
  team: '',
  demos: 'description',
  feedback: 'content',
  glossary: 'definition',
  initiatives: 'problem',
  tasks: 'description',
}

function folder(entity: string) {
  return entity.charAt(0).toUpperCase() + entity.slice(1)
}

function apiHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'ProductHUB',
  }
  if (TOKEN) h.Authorization = `token ${TOKEN}`
  return h
}

function safeId(id: string) {
  return String(id).replace(/[/\\?%*:|"<>]/g, '-')
}

export function isGithubMode() {
  return !!TOKEN
}

export async function ghListItems<T extends object>(entity: string): Promise<T[]> {
  const dir = `${VAULT_PATH}/${folder(entity)}`
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${dir}`
  const res = await fetch(url, { headers: apiHeaders(), cache: 'no-store' })
  if (!res.ok) return []

  const files = (await res.json()) as Array<{ name: string; url: string }>
  const mdFiles = files.filter(f => f.name.endsWith('.md'))

  const items = await Promise.all(
    mdFiles.map(async f => {
      // Use GitHub API URL (not download_url CDN) to avoid 5-min cache staleness after writes
      const fileRes = await fetch(f.url, { headers: apiHeaders(), cache: 'no-store' })
      const fileData = await fileRes.json() as { content: string }
      const raw = Buffer.from(fileData.content.replace(/\n/g, ''), 'base64').toString('utf8')
      const { data, content: body } = matter(raw)
      const bf = BODY_FIELD[entity]
      if (bf && body.trim()) data[bf] = body.trim()
      return data as T
    })
  )
  return items
}

async function getSha(filePath: string): Promise<string | null> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`
  const res = await fetch(url, { headers: apiHeaders(), cache: 'no-store' })
  if (!res.ok) return null
  const data = await res.json() as { sha: string }
  return data.sha ?? null
}

export async function ghWriteItem(entity: string, id: string, item: Record<string, unknown>): Promise<void> {
  const filePath = `${VAULT_PATH}/${folder(entity)}/${safeId(id)}.md`
  const bf = BODY_FIELD[entity]
  const body = bf ? String(item[bf] ?? '') : ''
  const fm: Record<string, unknown> = { ...item }
  if (bf) delete fm[bf]

  const content = Buffer.from(matter.stringify(body, fm)).toString('base64')
  const sha = await getSha(filePath)

  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`, {
    method: 'PUT',
    headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: sha ? `update: ${id}` : `create: ${id}`,
      content,
      ...(sha ? { sha } : {}),
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string }
    throw new Error(`GitHub ${res.status}: ${err.message ?? res.statusText}`)
  }
}

export async function ghDeleteItem(entity: string, id: string): Promise<void> {
  const filePath = `${VAULT_PATH}/${folder(entity)}/${safeId(id)}.md`
  const sha = await getSha(filePath)
  if (!sha) return

  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`, {
    method: 'DELETE',
    headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `delete: ${id}`, sha }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string }
    throw new Error(`GitHub ${res.status}: ${err.message ?? res.statusText}`)
  }
}
