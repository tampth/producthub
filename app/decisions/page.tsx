'use client'

import { useState } from 'react'
import { Plus, Search, Download, ChevronUp, ChevronDown } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { MarkdownEditor } from '@/components/ui/MarkdownEditor'
import { MarkdownViewer } from '@/components/ui/MarkdownViewer'
import { Badge } from '@/components/ui/Badge'
import { TagBadge } from '@/components/ui/Badge'
import { formatDate, downloadMarkdown, generateId } from '@/lib/utils'
import { useObsidian } from '@/lib/hooks/useObsidian'
import { Decision, DecisionStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUSES: DecisionStatus[] = ['proposed', 'accepted', 'rejected', 'deprecated']

export default function DecisionsPage() {
  const { items: decisions, loading, create: createDecision, update: updateDecision, remove: removeDecision } = useObsidian<Decision>('decisions')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortKey, setSortKey] = useState<keyof Decision>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Decision | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<Partial<Decision>>({ status: 'proposed', tags: [] })

  function handleSort(key: keyof Decision) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function handleCreate() {
    const d: Decision = {
      id: `ADR-${String(decisions.length + 1).padStart(3, '0')}`,
      title: form.title ?? '',
      context: form.context ?? '',
      decision: form.decision ?? '',
      consequences: form.consequences ?? '',
      status: form.status ?? 'proposed',
      author: form.author ?? 'Product Team',
      date: new Date().toISOString().split('T')[0],
      tags: form.tags ?? [],
    }
    createDecision(d)
    setShowNew(false)
    setSelected(d)
    setForm({ status: 'proposed', tags: [] })
  }

  function handleStatusChange(id: string, status: DecisionStatus) {
    const item = decisions.find(d => d.id === id)
    if (!item) return
    const updated = { ...item, status }
    updateDecision(updated)
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : s)
  }

  function handleExport(d: Decision) {
    const md = `# ${d.id}: ${d.title}\n\n**Date:** ${formatDate(d.date)}  \n**Author:** ${d.author}  \n**Status:** ${d.status}\n\n## Context\n\n${d.context}\n\n## Decision\n\n${d.decision}\n\n## Consequences\n\n${d.consequences}`
    downloadMarkdown(d.id, md)
  }

  const filtered = decisions
    .filter(d => !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.context.toLowerCase().includes(search.toLowerCase()))
    .filter(d => !filterStatus || d.status === filterStatus)
    .sort((a, b) => {
      const va = a[sortKey] ?? ''; const vb = b[sortKey] ?? ''
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })

  const SortIcon = ({ k }: { k: keyof Decision }) =>
    sortKey === k ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-sm text-gray-400">Loading...</div>
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-130px)]">
      {/* List */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-gray-100 space-y-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search decisions..." className="w-full text-xs border border-gray-200 rounded-md pl-7 pr-3 py-1.5 outline-none focus:border-blue-400" />
          </div>
          <div className="flex gap-2">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-blue-400 text-gray-600">
              <option value="">All</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => setShowNew(true)}
              className="flex items-center gap-1 text-xs bg-blue-600 text-white rounded-md px-3 py-1.5 hover:bg-blue-700">
              <Plus size={12} />New ADR
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No decisions yet.</div>
          ) : filtered.map(d => (
            <button key={d.id} onClick={() => setSelected(d)}
              className={`w-full text-left p-3 hover:bg-blue-50 transition-colors ${selected?.id === d.id ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-gray-400">{d.id}</span>
                <Badge value={d.status} />
              </div>
              <p className="text-xs font-medium text-gray-900 line-clamp-2">{d.title}</p>
              <p className="text-[11px] text-gray-400 mt-1">{formatDate(d.date)} · {d.author}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
        {selected ? (
          <>
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-400">{selected.id}</span>
                  <Badge value={selected.status} />
                </div>
                <h2 className="font-semibold text-gray-900 mt-0.5">{selected.title}</h2>
                <p className="text-xs text-gray-400">{formatDate(selected.date)} · {selected.author}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleExport(selected)}
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400" title="Export .md">
                  <Download size={14} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Context</h3>
                <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed">{selected.context}</div>
              </section>
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Decision</h3>
                <div className="text-sm text-gray-900 bg-blue-50 p-4 rounded-lg leading-relaxed font-medium">{selected.decision}</div>
              </section>
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Consequences</h3>
                <div className="text-sm text-gray-700 bg-yellow-50 p-4 rounded-lg leading-relaxed">{selected.consequences}</div>
              </section>
              {selected.tags.length > 0 && (
                <div className="flex gap-1">{selected.tags.map(t => <TagBadge key={t} tag={t} />)}</div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Update Status</label>
                <div className="flex gap-2">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => handleStatusChange(selected.id, s)}
                      className={cn('text-xs px-3 py-1 rounded-full border transition-colors',
                        selected.status === s ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center"><p className="text-4xl mb-2">📋</p><p className="text-sm">Select a decision to view</p></div>
          </div>
        )}
      </div>

      {/* New ADR Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Architecture Decision Record" size="lg">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Title *</label>
            <input value={form.title ?? ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Use Next.js App Router for ProductHUB"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          {[
            { key: 'context', label: 'Context', placeholder: 'What is the situation? What problem are we solving?' },
            { key: 'decision', label: 'Decision *', placeholder: 'What decision was made?' },
            { key: 'consequences', label: 'Consequences', placeholder: 'What are the trade-offs, risks, or outcomes?' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-gray-700 block mb-1">{f.label}</label>
              <textarea value={(form as Record<string, string>)[f.key] ?? ''}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder} rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-y" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Author</label>
              <input value={form.author ?? ''} onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
                placeholder="Your name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as DecisionStatus }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleCreate} disabled={!form.title || !form.decision}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              Create ADR
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
