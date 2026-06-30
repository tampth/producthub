'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Plus, Search, Download, ChevronUp, ChevronDown, X,
  Bug as BugIcon, CheckCircle, Clock, XCircle, AlertTriangle,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { MarkdownViewer } from '@/components/ui/MarkdownViewer'
import { Badge } from '@/components/ui/Badge'
import { TagBadge } from '@/components/ui/Badge'
import { formatDate, downloadMarkdown, generateId, SEVERITY_ICONS } from '@/lib/utils'
import { useObsidian } from '@/lib/hooks/useObsidian'
import { Bug, BugSeverity, BugStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const SEVERITIES: BugSeverity[] = ['low', 'medium', 'high', 'critical']
const STATUSES: BugStatus[] = ['open', 'in-progress', 'resolved', 'closed', 'wont-fix']

const STATUS_ICONS = {
  open: <AlertTriangle size={13} className="text-red-500" />,
  'in-progress': <Clock size={13} className="text-yellow-500" />,
  resolved: <CheckCircle size={13} className="text-green-500" />,
  closed: <XCircle size={13} className="text-gray-400" />,
  'wont-fix': <XCircle size={13} className="text-gray-300" />,
}

const STATUS_CARD_COLORS: Partial<Record<BugStatus, string>> = {
  open: 'border-red-200 bg-red-50 text-red-700',
  'in-progress': 'border-yellow-200 bg-yellow-50 text-yellow-700',
  resolved: 'border-green-200 bg-green-50 text-green-700',
  closed: 'border-gray-200 bg-gray-50 text-gray-500',
}

function BugsContent() {
  const searchParams = useSearchParams()
  const { items: bugs, loading, create: createBug, update: updateBug } = useObsidian<Bug>('bugs')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')
  const [sortKey, setSortKey] = useState<keyof Bug>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Bug | null>(null)
  const [showNew, setShowNew] = useState(searchParams.get('new') === '1')
  const [form, setForm] = useState<Partial<Bug>>({ severity: 'medium', status: 'open', tags: [] })

  function handleSort(key: keyof Bug) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function handleCreate() {
    const bug: Bug = {
      id: `INC-${String(bugs.length + 1).padStart(3, '0')}`,
      title: form.title ?? '',
      description: form.description ?? '',
      severity: form.severity ?? 'medium',
      status: 'open',
      reporter: form.reporter ?? 'Anonymous',
      assignee: form.assignee ?? '',
      date: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      steps: form.steps ?? '',
      expected: form.expected ?? '',
      actual: form.actual ?? '',
      environment: form.environment ?? '',
      tags: form.tags ?? [],
    }
    createBug(bug)
    setShowNew(false)
    setSelected(bug)
    setForm({ severity: 'medium', status: 'open', tags: [] })
  }

  function handleStatusChange(status: BugStatus) {
    if (!selected) return
    const updated = { ...selected, status, updatedAt: new Date().toISOString().split('T')[0] }
    updateBug(updated)
    setSelected(updated)
  }

  function handleExport(bug: Bug) {
    const md = `# ${bug.id}: ${bug.title}\n\n**Severity:** ${bug.severity}  \n**Status:** ${bug.status}  \n**Reporter:** ${bug.reporter}  \n**Environment:** ${bug.environment || '—'}  \n**Date:** ${formatDate(bug.date)}\n\n## Description\n\n${bug.description}\n\n## Steps to Reproduce\n\n${bug.steps || '—'}\n\n## Expected\n\n${bug.expected || '—'}\n\n## Actual\n\n${bug.actual || '—'}`
    downloadMarkdown(bug.id, md)
  }

  const filtered = bugs
    .filter(b => !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.description?.toLowerCase().includes(search.toLowerCase()))
    .filter(b => !filterStatus || b.status === filterStatus)
    .filter(b => !filterSeverity || b.severity === filterSeverity)
    .sort((a, b) => {
      const va = a[sortKey] ?? ''; const vb = b[sortKey] ?? ''
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })

  const SortIcon = ({ k }: { k: keyof Bug }) =>
    sortKey === k ? (sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : null

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Đang tải...</div>

  return (
    <div className="flex flex-col h-[calc(100vh-104px)] gap-3">

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        {(['open', 'in-progress', 'resolved', 'closed'] as BugStatus[]).map(s => {
          const count = bugs.filter(b => b.status === s).length
          const active = filterStatus === s
          return (
            <button key={s} onClick={() => setFilterStatus(prev => prev === s ? '' : s)}
              className={cn('rounded-xl border px-4 py-3 text-left transition-all hover:shadow-sm',
                active ? STATUS_CARD_COLORS[s] : 'bg-white border-gray-200 hover:bg-gray-50')}>
              <div className="flex items-center justify-between mb-1">
                {STATUS_ICONS[s]}
                <span className={cn('text-2xl font-bold', active ? '' : 'text-gray-900')}>{count}</span>
              </div>
              <p className={cn('text-xs capitalize', active ? '' : 'text-gray-500')}>{s}</p>
            </button>
          )
        })}
      </div>

      {/* Split layout */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* ── Left panel ───────────────────────────── */}
        <div className="w-72 flex-shrink-0 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden">

          {/* Filters */}
          <div className="p-3 border-b border-gray-100 space-y-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search bugs..."
                className="w-full text-xs border border-gray-200 rounded-md pl-7 pr-3 py-1.5 outline-none focus:border-blue-400" />
            </div>
            <div className="flex gap-2">
              <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
                className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none text-gray-600">
                <option value="">All severity</option>
                {SEVERITIES.map(s => <option key={s} value={s}>{SEVERITY_ICONS[s]} {s}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none text-gray-600">
                <option value="">All status</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={() => setShowNew(true)}
              className="w-full flex items-center justify-center gap-1 text-xs bg-red-600 text-white rounded-md py-1.5 hover:bg-red-700 transition-colors">
              <Plus size={12} /> Report Bug
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">No bugs found. 🎉</div>
            ) : filtered.map(bug => (
              <button key={bug.id} onClick={() => setSelected(bug)}
                className={cn('w-full text-left p-3 hover:bg-red-50 transition-colors',
                  selected?.id === bug.id ? 'bg-red-50 border-l-2 border-l-red-500' : 'border-l-2 border-l-transparent')}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-mono text-gray-400">{bug.id}</span>
                  <span className="text-xs">{SEVERITY_ICONS[bug.severity]}</span>
                  <Badge value={bug.severity} />
                </div>
                <p className="text-xs font-medium text-gray-900 leading-snug line-clamp-2">{bug.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <Badge value={bug.status} />
                  <span className="text-[10px] text-gray-400">{formatDate(bug.date)}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="px-3 py-2 border-t border-gray-100 text-[10px] text-gray-400">
            {filtered.length} of {bugs.length} bugs
          </div>
        </div>

        {/* ── Right panel ──────────────────────────── */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col min-w-0">
          {selected ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-gray-400">{selected.id}</span>
                    <span className="text-base">{SEVERITY_ICONS[selected.severity]}</span>
                    <Badge value={selected.severity} />
                    <Badge value={selected.status} />
                    {selected.environment && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{selected.environment}</span>
                    )}
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 leading-snug">{selected.title}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Reported by <strong className="text-gray-600">{selected.reporter}</strong>
                    {selected.assignee && <> · Assigned to <strong className="text-gray-600">{selected.assignee}</strong></>}
                    {' · '}{formatDate(selected.date)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => handleExport(selected)}
                    className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
                    <Download size={12} /> .md
                  </button>
                  <button onClick={() => setSelected(null)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Status strip */}
              <div className="px-6 py-2.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-gray-500 font-medium">Status:</span>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => handleStatusChange(s)}
                    className={cn('text-[11px] px-2.5 py-0.5 rounded-full border transition-colors',
                      selected.status === s
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-200 text-gray-500 hover:bg-white')}>
                    {s}
                  </button>
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                {/* Description */}
                {selected.description && (
                  <section>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
                    <MarkdownViewer content={selected.description} />
                  </section>
                )}

                {/* Steps / Expected / Actual */}
                {(selected.steps || selected.expected || selected.actual) && (
                  <section className="grid grid-cols-1 gap-4">
                    {selected.steps && (
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Steps to Reproduce</h3>
                        <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-4 whitespace-pre-wrap leading-relaxed text-gray-700 font-mono">{selected.steps}</pre>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {selected.expected && (
                        <div>
                          <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Expected</h3>
                          <div className="text-xs bg-green-50 border border-green-200 rounded-lg p-4 text-gray-700 leading-relaxed">{selected.expected}</div>
                        </div>
                      )}
                      {selected.actual && (
                        <div>
                          <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">Actual</h3>
                          <div className="text-xs bg-red-50 border border-red-200 rounded-lg p-4 text-gray-700 leading-relaxed">{selected.actual}</div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Tags */}
                {(selected.tags?.length ?? 0) > 0 && (
                  <div className="flex gap-1 flex-wrap pt-2 border-t border-gray-100">
                    {selected.tags.map(t => <TagBadge key={t} tag={t} />)}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
                <BugIcon size={20} className="text-red-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">Select a bug to view details</p>
              <p className="text-xs text-gray-400 max-w-xs">
                Click any incident on the left to see the full report — description, steps to reproduce, expected vs actual behavior.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Bug Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="🐛 Report a Bug" size="lg">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Title *</label>
            <input value={form.title ?? ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Brief description of the bug"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Description</label>
            <textarea value={form.description ?? ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="More detail about the bug..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-y" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Steps to Reproduce</label>
            <textarea value={form.steps ?? ''} onChange={e => setForm(p => ({ ...p, steps: e.target.value }))}
              rows={3} placeholder={"1. Go to...\n2. Click...\n3. Observe..."}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-blue-400 resize-y" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Expected Behavior</label>
              <textarea value={form.expected ?? ''} onChange={e => setForm(p => ({ ...p, expected: e.target.value }))}
                rows={2} placeholder="What should happen?"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-y" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Actual Behavior</label>
              <textarea value={form.actual ?? ''} onChange={e => setForm(p => ({ ...p, actual: e.target.value }))}
                rows={2} placeholder="What actually happens?"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-y" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Severity</label>
              <select value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value as BugSeverity }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
                {SEVERITIES.map(s => <option key={s} value={s}>{SEVERITY_ICONS[s]} {s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Environment</label>
              <input value={form.environment ?? ''} onChange={e => setForm(p => ({ ...p, environment: e.target.value }))}
                placeholder="e.g. Chrome, iOS, Web"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Your Name</label>
              <input value={form.reporter ?? ''} onChange={e => setForm(p => ({ ...p, reporter: e.target.value }))}
                placeholder="Your name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Assignee</label>
              <input value={form.assignee ?? ''} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))}
                placeholder="Who will fix this?"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleCreate} disabled={!form.title}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
              Submit Bug Report
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function BugsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>}>
      <BugsContent />
    </Suspense>
  )
}
