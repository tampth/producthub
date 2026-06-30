import { cn, STATUS_COLORS, PRIORITY_COLORS } from '@/lib/utils'

export function Badge({ value, type = 'status' }: { value: string; type?: 'status' | 'priority' | 'plain' }) {
  const colorMap = type === 'priority' ? PRIORITY_COLORS : STATUS_COLORS
  const colorClass = colorMap[value] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={cn('badge', colorClass)}>
      {value.replace(/-/g, ' ')}
    </span>
  )
}

export function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200">
      {tag}
    </span>
  )
}
