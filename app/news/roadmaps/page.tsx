'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  Map, CheckCircle2, Target, ArrowRight, AlertTriangle, Zap, DollarSign, Layers, MapPin,
} from 'lucide-react'
import { useObsidian } from '@/lib/hooks/useObsidian'
import { Initiative, InitiativeComplexity } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

const COMPLEXITY_COLORS: Record<InitiativeComplexity, string> = {
  low:         'bg-green-100 text-green-700',
  medium:      'bg-yellow-100 text-yellow-700',
  high:        'bg-orange-100 text-orange-700',
  'very-high': 'bg-red-100 text-red-700',
}

const STATUS_COLORS: Record<string, string> = {
  proposed:      'bg-gray-100 text-gray-600',
  approved:      'bg-blue-100 text-blue-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  completed:     'bg-green-100 text-green-700',
  'on-hold':     'bg-orange-100 text-orange-700',
  cancelled:     'bg-red-100 text-red-600',
}

function ComplexityDots({ level }: { level: InitiativeComplexity }) {
  const filled = { low: 1, medium: 2, high: 3, 'very-high': 4 }[level] ?? 0
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4].map(i => (
        <div key={i} className={cn('w-1.5 h-1.5 rounded-full', i <= filled ? 'bg-current' : 'bg-current opacity-20')} />
      ))}
    </div>
  )
}

function InitiativeCard({ item }: { item: Initiative }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-green-300 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[10px] font-mono text-gray-400">{item.id}</span>
            {item.product && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">{item.product}</span>}
          </div>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-green-800 transition-colors">
            {item.title}
          </h3>
          {item.objective && (
            <p className="text-[11px] text-gray-400 mt-0.5 leading-snug line-clamp-1">↳ {item.objective}</p>
          )}
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 whitespace-nowrap flex items-center gap-1 bg-green-100 text-green-700">
          <MapPin size={9} /> Roadmap
        </span>
      </div>

      {/* Summary fields */}
      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 mb-3">
        <div className="flex items-start gap-1.5">
          <Target size={10} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-2 leading-snug">{item.problem || <span className="text-gray-300">—</span>}</p>
        </div>
        <div className="flex items-start gap-1.5">
          <ArrowRight size={10} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-2 leading-snug">{item.solution || <span className="text-gray-300">—</span>}</p>
        </div>
        <div className="flex items-start gap-1.5">
          <Zap size={10} className="text-purple-400 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-1">{item.effort || <span className="text-gray-300">—</span>}</p>
        </div>
        <div className="flex items-start gap-1.5">
          <DollarSign size={10} className="text-green-500 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-1">{item.investment || <span className="text-gray-300">—</span>}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', STATUS_COLORS[item.status])}>{item.status}</span>
        <Badge value={item.priority} type="priority" />
        {item.complexity && (
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1', COMPLEXITY_COLORS[item.complexity])}>
            <ComplexityDots level={item.complexity} />
            {item.complexity}
          </span>
        )}
        {item.owner && <span className="text-[10px] text-gray-400 ml-auto">{item.owner}</span>}
      </div>
    </div>
  )
}

export default function RoadmapsPage() {
  const { items, loading } = useObsidian<Initiative>('initiatives')

  const roadmapItems = useMemo(
    () => items.filter(i => !!i.roadmap),
    [items]
  )

  const byQuarter = useMemo(() => {
    const map: Record<string, Initiative[]> = {}
    for (const item of roadmapItems) {
      const q = item.quarter || 'Unscheduled'
      if (!map[q]) map[q] = []
      map[q].push(item)
    }
    const sorted = Object.entries(map).sort(([a], [b]) => {
      if (a === 'Unscheduled') return 1
      if (b === 'Unscheduled') return -1
      return a.localeCompare(b)
    })
    return sorted
  }, [roadmapItems])

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-sm text-gray-400">Loading roadmap…</div>
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Map size={18} className="text-green-600" />
            <h1 className="text-xl font-bold text-gray-900">Product Roadmap</h1>
          </div>
          <p className="text-sm text-gray-500">
            Verified initiatives approved for the roadmap. Managed from{' '}
            <Link href="/initiatives" className="text-blue-600 hover:underline">Initiatives</Link>.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
            <p className="text-2xl font-bold text-green-700">{roadmapItems.length}</p>
            <p className="text-xs text-green-600">On Roadmap</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center">
            <p className="text-2xl font-bold text-gray-700">{byQuarter.length}</p>
            <p className="text-xs text-gray-500">Quarters</p>
          </div>
        </div>
      </div>

      {roadmapItems.length === 0 ? (
        /* Empty state */
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={22} className="text-green-400" />
          </div>
          <p className="text-gray-700 font-semibold mb-1">No initiatives on the roadmap yet</p>
          <p className="text-sm text-gray-400 mb-4 max-w-sm mx-auto">
            Go to Initiatives, verify all 6 fields (problem, solution, complexity, risks, effort, investment), then click &quot;Add to Roadmap&quot;.
          </p>
          <Link href="/initiatives"
            className="inline-flex items-center gap-1.5 text-sm bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">
            <CheckCircle2 size={14} /> Go to Initiatives
          </Link>
        </div>
      ) : (
        /* Quarter timeline */
        <div className="space-y-10">
          {byQuarter.map(([quarter, qItems]) => (
            <div key={quarter}>
              {/* Quarter header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                  <Layers size={13} />
                  {quarter}
                </div>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">{qItems.length} initiative{qItems.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Initiative cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {qItems.map(item => (
                  <InitiativeCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tip */}
      <div className="text-xs text-gray-400 border-t border-gray-100 pt-4 flex items-center gap-2">
        <AlertTriangle size={11} className="text-amber-400" />
        Only initiatives with all 6 fields verified (problem, solution, complexity, risks, effort, investment) can be added here.
        Manage from <Link href="/initiatives" className="text-blue-500 hover:underline ml-1">Initiatives →</Link>
      </div>
    </div>
  )
}
