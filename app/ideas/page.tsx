'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Plus, Search, ThumbsUp, ChevronUp, ChevronDown,
  Download, Rocket, FileText, X,
} from 'lucide-react'
import Link from 'next/link'
import { Modal } from '@/components/ui/Modal'
import { MarkdownViewer } from '@/components/ui/MarkdownViewer'
import { MarkdownEditor } from '@/components/ui/MarkdownEditor'
import { Badge } from '@/components/ui/Badge'
import { TagBadge } from '@/components/ui/Badge'
import { formatDate, downloadMarkdown, generateId } from '@/lib/utils'
import { useObsidian } from '@/lib/hooks/useObsidian'
import { Idea, IdeaStatus, IdeaType, Priority } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUSES: IdeaStatus[] = ['submitted', 'in-review', 'approved', 'rejected', 'implemented']
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical']

function IdeasContent() {
  const searchParams = useSearchParams()
  const defaultTab = (searchParams.get('tab') as IdeaType) ?? 'idea'

  const { items: ideas, loading, create: createIdea, update: updateIdea } = useObsidian<Idea>('ideas')
  const [tab, setTab] = useState<IdeaType>(defaultTab)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [sortKey, setSortKey] = useState<keyof Idea>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Idea | null>(null)
  const [editing, setEditing] = useState(false)
  const [editDescription, setEditDescription] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<Partial<Idea>>({
    type: defaultTab, status: 'submitted', priority: 'medium', tags: [], votes: 0,
  })

  function handleSort(key: keyof Idea) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function handleCreate() {
    const idea: Idea = {
      id: generateId(),
      title: form.title ?? '',
      description: form.description ?? '',
      type: form.type ?? tab,
      status: 'submitted',
      priority: form.priority ?? 'medium',
      submitter: form.submitter ?? 'Anonymous',
      team: form.team ?? '',
      date: new Date().toISOString().split('T')[0],
      tags: form.tags ?? [],
      votes: 0,
    }
    createIdea(idea)
    setShowNew(false)
    setSelected(idea)
    setForm({ type: tab, status: 'submitted', priority: 'medium', tags: [], votes: 0 })
  }

  function handleVote(idea: Idea) {
    const updated = { ...idea, votes: idea.votes + 1 }
    updateIdea(updated)
    if (selected?.id === idea.id) setSelected(updated)
  }

  function handleStatusChange(status: IdeaStatus) {
    if (!selected) return
    const updated = { ...selected, status }
    updateIdea(updated)
    setSelected(updated)
  }

  function handleSaveDescription() {
    if (!selected) return
    const updated = { ...selected, description: editDescription }
    updateIdea(updated)
    setSelected(updated)
    setEditing(false)
  }

  function handleSelect(idea: Idea) {
    setSelected(idea)
    setEditing(false)
  }

  function handleExport(idea: Idea) {
    const md = `# ${idea.id}: ${idea.title}\n\n**Type:** ${idea.type}  \n**Status:** ${idea.status}  \n**Priority:** ${idea.priority}  \n**Submitter:** ${idea.submitter} · ${idea.team}  \n**Date:** ${formatDate(idea.date)}  \n**Votes:** ${idea.votes}\n\n---\n\n${idea.description}`
    downloadMarkdown(idea.id, md)
  }

  const visible = ideas.filter(i => i.type === tab)
  const filtered = visible
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase()))
    .filter(i => !filterStatus || i.status === filterStatus)
    .filter(i => !filterPriority || i.priority === filterPriority)
    .sort((a, b) => {
      const va = a[sortKey] ?? ''; const vb = b[sortKey] ?? ''
      const cmp = String(va).localeCompare(String(vb))
      return sortDir === 'asc' ? cmp : -cmp
    })

  const SortIcon = ({ k }: { k: keyof Idea }) =>
    sortKey === k ? (sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : null

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Đang tải...</div>

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] gap-0">

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 pb-0 mb-3">
        {(['idea', 'request'] as IdeaType[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setSelected(null) }}
            className={cn('px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-900')}>
            {t === 'idea' ? '💡 Ideas' : '📋 Requests'}
            <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
              {ideas.filter(i => i.type === t).length}
            </span>
          </button>
        ))}
      </div>

      {/* Split view */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* ── Left panel: list ─────────────────────── */}
        <div className="w-72 flex-shrink-0 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden">

          {/* Search + filters */}
          <div className="p-3 border-b border-gray-100 space-y-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${tab}s...`}
                className="w-full text-xs border border-gray-200 rounded-md pl-7 pr-3 py-1.5 outline-none focus:border-blue-400" />
            </div>
            <div className="flex gap-2">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none text-gray-600">
                <option value="">All status</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none text-gray-600">
                <option value="">All priority</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <button
              onClick={() => { setForm({ type: tab, status: 'submitted', priority: 'medium', tags: [], votes: 0 }); setShowNew(true) }}
              className="w-full flex items-center justify-center gap-1 text-xs bg-blue-600 text-white rounded-md py-1.5 hover:bg-blue-700 transition-colors">
              <Plus size={12} /> {tab === 'idea' ? 'New Idea' : 'New Request'}
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">No {tab}s found.</div>
            ) : filtered.map(idea => (
              <button key={idea.id} onClick={() => handleSelect(idea)}
                className={cn('w-full text-left p-3 hover:bg-blue-50 transition-colors',
                  selected?.id === idea.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : 'border-l-2 border-l-transparent')}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-mono text-gray-400">{idea.id.slice(0, 8)}</span>
                  <Badge value={idea.status} />
                  <Badge value={idea.priority} type="priority" />
                </div>
                <p className="text-xs font-medium text-gray-900 leading-snug line-clamp-2">{idea.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-gray-400">{idea.submitter} · {formatDate(idea.date)}</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                    <ThumbsUp size={9} /> {idea.votes}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Footer count */}
          <div className="px-3 py-2 border-t border-gray-100 text-[10px] text-gray-400">
            {filtered.length} of {visible.length} {tab}s
          </div>
        </div>

        {/* ── Right panel: markdown view ───────────── */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col min-w-0">
          {selected ? (
            <>
              {/* Detail header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-gray-400">{selected.id}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{selected.type}</span>
                    <Badge value={selected.status} />
                    <Badge value={selected.priority} type="priority" />
                    {selected.team && <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{selected.team}</span>}
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 leading-snug">{selected.title}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{selected.submitter} · {formatDate(selected.date)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => handleVote(selected)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-blue-300 transition-colors">
                    <ThumbsUp size={13} /> {selected.votes}
                  </button>
                  <button onClick={() => { setEditing(true); setEditDescription(selected.description) }}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
                    <FileText size={12} /> Edit
                  </button>
                  <button onClick={() => handleExport(selected)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
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
                {selected.status === 'approved' && (
                  <Link href="/initiatives"
                    className="ml-auto flex items-center gap-1 text-[11px] text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5 hover:bg-green-100 transition-colors">
                    <Rocket size={10} /> Escalate to Initiative →
                  </Link>
                )}
              </div>

              {/* Markdown body */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                {editing ? (
                  <div className="space-y-3 h-full flex flex-col">
                    <MarkdownEditor
                      value={editDescription}
                      onChange={setEditDescription}
                      minRows={16}
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditing(false)}
                        className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                        Cancel
                      </button>
                      <button onClick={handleSaveDescription}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-2xl">
                    {selected.description
                      ? <MarkdownViewer content={selected.description} />
                      : <p className="text-gray-400 text-sm italic">No description yet. Click Edit to add content.</p>
                    }
                    {(selected.tags?.length ?? 0) > 0 && (
                      <div className="flex gap-1 flex-wrap mt-6 pt-4 border-t border-gray-100">
                        {selected.tags.map(t => <TagBadge key={t} tag={t} />)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                <FileText size={20} className="text-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">Select an item to read</p>
              <p className="text-xs text-gray-400 max-w-xs">
                Click any {tab} on the left to view its full content as a markdown document.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Idea/Request modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)}
        title={tab === 'idea' ? '💡 New Idea' : '📋 New Request'} size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Title *</label>
            <input value={form.title ?? ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder={tab === 'idea' ? 'e.g. Automated onboarding checklist' : 'e.g. Add Slack notifications for releases'}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Description</label>
            <textarea value={form.description ?? ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={5} placeholder={`## Vấn đề / Problem\n\n## Đề xuất / Proposal\n\n## Giá trị kỳ vọng / Expected Value`}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-y font-mono text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Your Name</label>
              <input value={form.submitter ?? ''} onChange={e => setForm(p => ({ ...p, submitter: e.target.value }))}
                placeholder="Name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Team</label>
              <input value={form.team ?? ''} onChange={e => setForm(p => ({ ...p, team: e.target.value }))}
                placeholder="e.g. Ops, Dev, Product"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as Priority }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Tags</label>
              <input
                onChange={e => setForm(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                placeholder="automation, ux, …"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowNew(false)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleCreate} disabled={!form.title}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              Submit {tab === 'idea' ? 'Idea' : 'Request'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function IdeasPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>}>
      <IdeasContent />
    </Suspense>
  )
}
