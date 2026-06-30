import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | undefined | null) {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)
  return format(d, 'dd MMM yyyy')
}

export function formatRelative(date: string | undefined | null) {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)
  return formatDistanceToNow(d, { addSuffix: true })
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function exportToMarkdown(title: string, content: object | string): string {
  if (typeof content === 'string') return content
  return `# ${title}\n\n\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\``
}

export function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadJson(filename: string, content: object) {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export const STATUS_COLORS: Record<string, string> = {
  // Ideas
  submitted: 'bg-blue-50 text-blue-700',
  'in-review': 'bg-yellow-50 text-yellow-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  implemented: 'bg-purple-50 text-purple-700',
  // Bugs
  open: 'bg-red-50 text-red-700',
  'in-progress': 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
  'wont-fix': 'bg-gray-100 text-gray-500',
  // Backlog
  backlog: 'bg-gray-100 text-gray-600',
  todo: 'bg-blue-50 text-blue-700',
  done: 'bg-green-50 text-green-700',
  blocked: 'bg-red-50 text-red-700',
  // Decisions
  proposed: 'bg-yellow-50 text-yellow-700',
  accepted: 'bg-green-50 text-green-700',
  deprecated: 'bg-gray-100 text-gray-500',
  // Requirements
  draft: 'bg-gray-100 text-gray-600',
  review: 'bg-yellow-50 text-yellow-700',
  // Feedback
  new: 'bg-blue-50 text-blue-700',
  acknowledged: 'bg-yellow-50 text-yellow-700',
  addressed: 'bg-green-50 text-green-700',
}

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-50 text-blue-700',
  high: 'bg-orange-50 text-orange-700',
  critical: 'bg-red-50 text-red-700',
}

export const SEVERITY_ICONS: Record<string, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🟠',
  critical: '🔴',
}
