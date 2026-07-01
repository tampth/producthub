import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || path.join(process.cwd(), 'vault')
const HUB_FOLDER = process.env.OBSIDIAN_PRODUCTHUB_FOLDER ?? 'ProductHUB'

// Field whose value goes into the markdown body; everything else → YAML frontmatter
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

function hubDir(entity: string): string {
  const folder = entity.charAt(0).toUpperCase() + entity.slice(1)
  return path.join(VAULT_PATH, HUB_FOLDER, folder)
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function safeId(id: string): string {
  return String(id).replace(/[/\\?%*:|"<>]/g, '-')
}

export function hasItems(entity: string): boolean {
  const dir = hubDir(entity)
  if (!fs.existsSync(dir)) return false
  return fs.readdirSync(dir).some(f => f.endsWith('.md'))
}

export function listItems<T extends object>(entity: string): T[] {
  const dir = hubDir(entity)
  ensureDir(dir)
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8')
      const { data, content: bodyContent } = matter(raw)
      const bodyField = BODY_FIELD[entity]
      if (bodyField && bodyContent.trim()) {
        data[bodyField] = bodyContent.trim()
      }
      return data as T
    })
}

export function writeItem(
  entity: string,
  id: string,
  item: Record<string, unknown>
): void {
  const dir = hubDir(entity)
  ensureDir(dir)

  const bodyField = BODY_FIELD[entity]
  const bodyContent = bodyField ? String(item[bodyField] ?? '') : ''
  const frontmatter: Record<string, unknown> = { ...item }
  if (bodyField) delete frontmatter[bodyField]

  const filepath = path.join(dir, `${safeId(id)}.md`)
  const fileContent = matter.stringify(bodyContent, frontmatter)
  fs.writeFileSync(filepath, fileContent, 'utf8')
}

export function deleteItem(entity: string, id: string): void {
  const filepath = path.join(hubDir(entity), `${safeId(id)}.md`)
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
}

export function getVaultInfo() {
  const hubPath = path.join(VAULT_PATH, HUB_FOLDER)
  const connected = !!VAULT_PATH && fs.existsSync(VAULT_PATH)
  const entities = ['ideas', 'bugs', 'backlog', 'requirements', 'decisions', 'news', 'team', 'demos', 'feedback', 'glossary', 'initiatives', 'tasks']
  const counts: Record<string, number> = {}
  if (connected) {
    for (const e of entities) {
      const dir = hubDir(e)
      counts[e] = fs.existsSync(dir)
        ? fs.readdirSync(dir).filter(f => f.endsWith('.md')).length
        : 0
    }
  }
  return { vaultPath: VAULT_PATH, hubFolder: HUB_FOLDER, hubPath, connected, counts }
}
