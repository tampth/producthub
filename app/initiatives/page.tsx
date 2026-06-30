'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Search, ChevronLeft, ChevronRight, X, Target, AlertTriangle,
  Zap, DollarSign, Layers, ArrowRight, ChevronUp, ChevronDown,
  CheckCircle2, Circle, MapPin, MapPinOff,
} from 'lucide-react'
import { useObsidian } from '@/lib/hooks/useObsidian'
import { Initiative, InitiativeStatus, InitiativeComplexity, Priority } from '@/lib/types'
import { formatDate, generateId } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'

/* ── Constants ────────────────────────────────────── */

const STATUSES: InitiativeStatus[] = ['proposed', 'approved', 'in-progress', 'completed', 'on-hold', 'cancelled']
const COMPLEXITIES: InitiativeComplexity[] = ['low', 'medium', 'high', 'very-high']
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical']

const VERIFY_FIELDS: { key: keyof Initiative; label: string }[] = [
  { key: 'problem',    label: 'Problem' },
  { key: 'solution',   label: 'Solution' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'risks',      label: 'Risks' },
  { key: 'effort',     label: 'Effort' },
  { key: 'investment', label: 'Investment' },
]

const STATUS_COLORS: Record<InitiativeStatus, string> = {
  proposed:      'bg-gray-100 text-gray-600',
  approved:      'bg-blue-100 text-blue-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  completed:     'bg-green-100 text-green-700',
  'on-hold':     'bg-orange-100 text-orange-700',
  cancelled:     'bg-red-100 text-red-600',
}

const COMPLEXITY_COLORS: Record<InitiativeComplexity, string> = {
  low:         'bg-green-100 text-green-700',
  medium:      'bg-yellow-100 text-yellow-700',
  high:        'bg-orange-100 text-orange-700',
  'very-high': 'bg-red-100 text-red-700',
}

const COMPLEXITY_BARS: Record<InitiativeComplexity, number> = { low: 1, medium: 2, high: 3, 'very-high': 4 }

/* ── Helpers ──────────────────────────────────────── */

function isVerified(i: Initiative): boolean {
  return VERIFY_FIELDS.every(f => !!i[f.key])
}

function verifiedCount(i: Initiative): number {
  return VERIFY_FIELDS.filter(f => !!i[f.key]).length
}

/* ── Sub-components ───────────────────────────────── */

function ComplexityBar({ level }: { level: InitiativeComplexity }) {
  const filled = COMPLEXITY_BARS[level] ?? 0
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={cn('w-2 h-3 rounded-sm', i <= filled ? 'bg-current opacity-80' : 'bg-current opacity-20')} />
      ))}
    </div>
  )
}

function VerifyChecklist({ item }: { item: Initiative }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {VERIFY_FIELDS.map(f => {
        const filled = !!item[f.key]
        return (
          <div key={f.key} className={cn('flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md',
            filled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400')}>
            {filled
              ? <CheckCircle2 size={11} className="flex-shrink-0" />
              : <Circle size={11} className="flex-shrink-0" />}
            {f.label}
          </div>
        )
      })}
    </div>
  )
}

function Section({ icon: Icon, title, children, color = 'text-gray-500' }: {
  icon: React.ElementType; title: string; children: React.ReactNode; color?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon size={14} className={color} />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
      </div>
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {children || <span className="text-gray-300 italic">Not specified</span>}
      </div>
    </div>
  )
}

/* ── 1-Pager ──────────────────────────────────────── */

function OnePager({ items, index, onClose, onNav, onToggleRoadmap }: {
  items: Initiative[]
  index: number
  onClose: () => void
  onNav: (i: number) => void
  onToggleRoadmap: (item: Initiative) => void
}) {
  const item = items[index]

  useEffect(() => {
    if (!item) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' && index > 0) onNav(index - 1)
      if (e.key === 'ArrowRight' && index < items.length - 1) onNav(index + 1)
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [index, items.length, onNav, onClose, item])

  if (!item) return null

  const verified = isVerified(item)

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Left panel */}
      <div className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">All Initiatives</p>
          <span className="text-xs text-gray-400">{items.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {items.map((it, i) => (
            <button key={it.id} onClick={() => onNav(i)}
              className={cn('w-full text-left px-4 py-2.5 border-l-2 transition-colors',
                i === index ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:bg-gray-100')}>
              <div className="flex items-center gap-1.5 mb-0.5">
                {it.roadmap && <MapPin size={9} className="text-green-500 flex-shrink-0" />}
                <p className={cn('text-xs font-medium leading-snug line-clamp-2', i === index ? 'text-blue-700' : 'text-gray-800')}>
                  {it.title}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', STATUS_COLORS[it.status])}>{it.status}</span>
                {it.quarter && <span className="text-[10px] text-gray-400">{it.quarter}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main 1-pager */}
      <div className="flex-1 bg-white flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-200 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400 font-mono">{item.id}</span>
              {item.product && <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{item.product}</span>}
              {item.quarter && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.quarter}</span>}
              {item.roadmap && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin size={10} /> On Roadmap
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 leading-snug">{item.title}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[item.status])}>{item.status}</span>
              <Badge value={item.priority} type="priority" />
              {item.complexity && (
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1.5', COMPLEXITY_COLORS[item.complexity])}>
                  <ComplexityBar level={item.complexity} />
                  {item.complexity} complexity
                </span>
              )}
              {item.owner && <span className="text-xs text-gray-500">Owner: <strong>{item.owner}</strong></span>}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Add / Remove Roadmap action */}
            {verified ? (
              <button onClick={() => onToggleRoadmap(item)}
                className={cn('flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors',
                  item.roadmap
                    ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                    : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100')}>
                {item.roadmap ? <><MapPinOff size={13} /> Remove from Roadmap</> : <><MapPin size={13} /> Add to Roadmap</>}
              </button>
            ) : (
              <div className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <Circle size={11} />
                {verifiedCount(item)}/6 fields to roadmap
              </div>
            )}
            <button onClick={() => onNav(index - 1)} disabled={index === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-gray-400 min-w-[40px] text-center">{index + 1} / {items.length}</span>
            <button onClick={() => onNav(index + 1)} disabled={index === items.length - 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={16} />
            </button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 ml-1">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Verification status */}
        <div className="px-8 py-3 bg-gray-50 border-b border-gray-100">
          <VerifyChecklist item={item} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-3xl space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                <Section icon={Target} title="Problem" color="text-red-500">{item.problem}</Section>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <Section icon={ArrowRight} title="Solution" color="text-blue-500">{item.solution}</Section>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <Section icon={Layers} title="Complexity" color="text-orange-500">
                  {item.complexity && (
                    <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium', COMPLEXITY_COLORS[item.complexity])}>
                      <ComplexityBar level={item.complexity} />
                      {item.complexity.replace('-', ' ')}
                    </div>
                  )}
                </Section>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <Section icon={AlertTriangle} title="Risks" color="text-amber-500">{item.risks}</Section>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <Section icon={Zap} title="Effort" color="text-purple-500">{item.effort}</Section>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <Section icon={DollarSign} title="Investment" color="text-green-600">{item.investment}</Section>
              </div>
            </div>
            {(item.objective || (item.tags?.length ?? 0) > 0) && (
              <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                {item.objective && <span><strong className="text-gray-700">Objective:</strong> {item.objective}</span>}
                {(item.tags?.length ?? 0) > 0 && (
                  <span className="flex gap-1 flex-wrap">
                    {item.tags.map(t => <span key={t} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>)}
                  </span>
                )}
                {item.date && <span className="ml-auto">{formatDate(item.date)}</span>}
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-2 border-t border-gray-100 bg-gray-50 flex items-center gap-2 text-[11px] text-gray-400">
          <span>← → to navigate</span><span>·</span><span>Esc to close</span>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ────────────────────────────────────── */

const BLANK_FORM: Partial<Initiative> = {
  status: 'proposed', priority: 'medium', complexity: 'medium', tags: [],
}

export default function InitiativesPage() {
  const { items, loading, create, update } = useObsidian<Initiative>('initiatives')

  const [search, setSearch]           = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterProduct, setFilterProduct] = useState('')
  const [filterQuarter, setFilterQuarter] = useState('')
  const [filterRoadmap, setFilterRoadmap] = useState<'' | 'roadmap' | 'not-roadmap'>('')
  const [sortKey, setSortKey]         = useState<keyof Initiative>('date')
  const [sortDir, setSortDir]         = useState<'asc' | 'desc'>('desc')
  const [onePagerIdx, setOnePagerIdx] = useState<number | null>(null)
  const [showNew, setShowNew]         = useState(false)
  const [form, setForm]               = useState<Partial<Initiative>>(BLANK_FORM)

  const products = [...new Set(items.map(i => i.product).filter(Boolean))]
  const quarters = [...new Set(items.map(i => i.quarter).filter(Boolean))].sort()

  function handleSort(key: keyof Initiative) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function handleCreate() {
    if (!form.title) return
    const item: Initiative = {
      id: `INIT-${generateId().slice(0, 6).toUpperCase()}`,
      title: form.title,
      status: form.status ?? 'proposed',
      priority: form.priority ?? 'medium',
      product: form.product ?? '',
      owner: form.owner ?? '',
      quarter: form.quarter ?? '',
      objective: form.objective ?? '',
      problem: form.problem ?? '',
      solution: form.solution ?? '',
      complexity: form.complexity ?? 'medium',
      risks: form.risks ?? '',
      effort: form.effort ?? '',
      investment: form.investment ?? '',
      roadmap: false,
      date: new Date().toISOString().split('T')[0],
      tags: form.tags ?? [],
    }
    create(item)
    setShowNew(false)
    setForm(BLANK_FORM)
  }

  function handleToggleRoadmap(item: Initiative) {
    update({ ...item, roadmap: !item.roadmap })
    if (onePagerIdx !== null) {
      // Force re-render by keeping same index
    }
  }

  const filtered = items
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()))
    .filter(i => !filterStatus || i.status === filterStatus)
    .filter(i => !filterProduct || i.product === filterProduct)
    .filter(i => !filterQuarter || i.quarter === filterQuarter)
    .filter(i => filterRoadmap === 'roadmap' ? !!i.roadmap : filterRoadmap === 'not-roadmap' ? !i.roadmap : true)
    .sort((a, b) => {
      const va = a[sortKey] ?? ''; const vb = b[sortKey] ?? ''
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })

  const SortIcon = ({ k }: { k: keyof Initiative }) =>
    sortKey === k ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null

  const roadmapCount = items.filter(i => i.roadmap).length

  if (loading) return <div className="flex items-center justify-center h-64 text-sm text-gray-400">Loading...</div>

  return (
    <>
      {onePagerIdx !== null && (
        <OnePager
          items={filtered}
          index={onePagerIdx}
          onClose={() => setOnePagerIdx(null)}
          onNav={setOnePagerIdx}
          onToggleRoadmap={handleToggleRoadmap}
        />
      )}

      <div className="space-y-4">
        {/* Summary bar */}
        <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
          <span className="font-medium text-gray-700">{items.length} initiatives</span>
          <span>·</span>
          <span>{items.filter(isVerified).length} verified</span>
          <span>·</span>
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <MapPin size={11} /> {roadmapCount} on roadmap
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search initiatives..."
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 w-52" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 text-gray-600">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {products.length > 0 && (
            <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 text-gray-600">
              <option value="">All Products</option>
              {products.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
          {quarters.length > 0 && (
            <select value={filterQuarter} onChange={e => setFilterQuarter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 text-gray-600">
              <option value="">All Quarters</option>
              {quarters.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          )}
          <select value={filterRoadmap} onChange={e => setFilterRoadmap(e.target.value as '' | 'roadmap' | 'not-roadmap')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 text-gray-600">
            <option value="">All</option>
            <option value="roadmap">On Roadmap</option>
            <option value="not-roadmap">Not on Roadmap</option>
          </select>
          <div className="ml-auto flex gap-2">
            {filtered.length > 0 && (
              <button onClick={() => setOnePagerIdx(0)}
                className="flex items-center gap-1.5 text-sm border border-blue-200 bg-blue-50 text-blue-700 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors">
                <ChevronRight size={14} /> Review All
              </button>
            )}
            <button onClick={() => setShowNew(true)}
              className="flex items-center gap-1.5 text-sm bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700">
              <Plus size={14} /> New Initiative
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="airtable-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} className="w-28">ID <SortIcon k="id" /></th>
                  <th onClick={() => handleSort('title')}>Initiative <SortIcon k="title" /></th>
                  <th onClick={() => handleSort('status')}>Status <SortIcon k="status" /></th>
                  <th onClick={() => handleSort('priority')}>Priority <SortIcon k="priority" /></th>
                  <th onClick={() => handleSort('complexity')}>Complexity <SortIcon k="complexity" /></th>
                  <th>Verified</th>
                  <th onClick={() => handleSort('quarter')}>Quarter <SortIcon k="quarter" /></th>
                  <th onClick={() => handleSort('owner')}>Owner <SortIcon k="owner" /></th>
                  <th className="w-36"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                    No initiatives found.
                  </td></tr>
                ) : filtered.map((item, i) => {
                  const verified = isVerified(item)
                  const count = verifiedCount(item)
                  return (
                    <tr key={item.id} className="cursor-pointer" onClick={() => setOnePagerIdx(i)}>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {item.roadmap && <MapPin size={11} className="text-green-500 flex-shrink-0" />}
                          <span className="text-xs font-mono text-gray-400">{item.id}</span>
                        </div>
                      </td>
                      <td>
                        <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.title}</p>
                        {item.objective && <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">↳ {item.objective}</p>}
                      </td>
                      <td><span className={cn('badge text-[11px]', STATUS_COLORS[item.status])}>{item.status}</span></td>
                      <td><Badge value={item.priority} type="priority" /></td>
                      <td>
                        {item.complexity && (
                          <span className={cn('badge text-[11px] flex items-center gap-1.5', COMPLEXITY_COLORS[item.complexity])}>
                            <ComplexityBar level={item.complexity} />
                            {item.complexity}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-0.5">
                            {[0,1,2,3,4,5].map(n => (
                              <div key={n} className={cn('w-2 h-2 rounded-sm', n < count ? 'bg-green-400' : 'bg-gray-200')} />
                            ))}
                          </div>
                          <span className="text-[11px] text-gray-400">{count}/6</span>
                        </div>
                      </td>
                      <td>
                        {item.quarter
                          ? <span className="badge text-[11px] bg-indigo-50 text-indigo-600">{item.quarter}</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="text-sm text-gray-600">{item.owner || <span className="text-gray-300">—</span>}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={e => { e.stopPropagation(); setOnePagerIdx(i) }}
                            className="text-[11px] text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                            1-Pager →
                          </button>
                          {verified && !item.roadmap && (
                            <button onClick={e => { e.stopPropagation(); handleToggleRoadmap(item) }}
                              className="text-[11px] text-green-600 hover:text-green-800 font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors flex items-center gap-0.5">
                              <MapPin size={10} /> Add
                            </button>
                          )}
                          {item.roadmap && (
                            <span className="text-[11px] text-green-600 font-medium px-2 py-1 flex items-center gap-0.5">
                              <MapPin size={10} /> Roadmap
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-400">
            {filtered.length} initiative{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* New Initiative Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Initiative" size="lg">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Title *</label>
            <input value={form.title ?? ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Unified customer profile across channels"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as InitiativeStatus }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as Priority }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Complexity</label>
              <select value={form.complexity} onChange={e => setForm(p => ({ ...p, complexity: e.target.value as InitiativeComplexity }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
                {COMPLEXITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Product</label>
              <input value={form.product ?? ''} onChange={e => setForm(p => ({ ...p, product: e.target.value }))}
                placeholder="e.g. OMNI / Call Center"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Quarter</label>
              <input value={form.quarter ?? ''} onChange={e => setForm(p => ({ ...p, quarter: e.target.value }))}
                placeholder="e.g. Q3 2026"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Owner</label>
              <input value={form.owner ?? ''} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))}
                placeholder="Owner name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Objective / Strategic link</label>
            <input value={form.objective ?? ''} onChange={e => setForm(p => ({ ...p, objective: e.target.value }))}
              placeholder="e.g. Improve customer satisfaction NPS by 15pts"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Problem</label>
              <textarea value={form.problem ?? ''} onChange={e => setForm(p => ({ ...p, problem: e.target.value }))}
                rows={3} placeholder="What problem does this solve?"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-y" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Solution</label>
              <textarea value={form.solution ?? ''} onChange={e => setForm(p => ({ ...p, solution: e.target.value }))}
                rows={3} placeholder="What are we building?"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-y" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Risks</label>
              <textarea value={form.risks ?? ''} onChange={e => setForm(p => ({ ...p, risks: e.target.value }))}
                rows={2} placeholder="Key risks and dependencies"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-y" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Effort</label>
              <textarea value={form.effort ?? ''} onChange={e => setForm(p => ({ ...p, effort: e.target.value }))}
                rows={2} placeholder="e.g. 6 weeks · 3 engineers"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-y" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Investment</label>
            <input value={form.investment ?? ''} onChange={e => setForm(p => ({ ...p, investment: e.target.value }))}
              placeholder="e.g. ~200M VND / 2 FTEs for 2 months"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleCreate} disabled={!form.title}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              Create Initiative
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
