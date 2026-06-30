'use client'

import { useState } from 'react'
import { Plus, Search, Download, Upload, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { MarkdownEditor } from '@/components/ui/MarkdownEditor'
import { MarkdownViewer } from '@/components/ui/MarkdownViewer'
import { Badge } from '@/components/ui/Badge'
import { TagBadge } from '@/components/ui/Badge'
import { formatDate, downloadMarkdown, generateId } from '@/lib/utils'
import { useObsidian } from '@/lib/hooks/useObsidian'
import { Requirement, RequirementStatus, Priority } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUSES: RequirementStatus[] = ['draft', 'review', 'approved', 'implemented']
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical']

export default function RequirementsPage() {
  const { items: requirements, loading, create: createReq, update: updateReq, remove: removeReq } = useObsidian<Requirement>('requirements')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterEpic, setFilterEpic] = useState('')
  const [sortKey, setSortKey] = useState<keyof Requirement>('updatedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Requirement | null>(null)
  const [editing, setEditing] = useState<Requirement | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<Partial<Requirement>>({ status: 'draft', priority: 'medium', tags: [] })

  const epics = [...new Set(requirements.map(r => r.epic).filter(Boolean))]

  function handleSort(key: keyof Requirement) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function save(req: Requirement) {
    const exists = requirements.some(r => r.id === req.id)
    if (exists) updateReq(req)
    else createReq(req)
  }

  function handleCreate() {
    const req: Requirement = {
      id: `REQ-${String(requirements.length + 1).padStart(3, '0')}`,
      title: form.title ?? '', epic: form.epic ?? '',
      description: form.description ?? '', acceptanceCriteria: form.acceptanceCriteria ?? '',
      status: form.status ?? 'draft', priority: form.priority ?? 'medium',
      author: form.author ?? 'BA Team', assignee: form.assignee ?? '',
      date: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0],
      tags: form.tags ?? [],
    }
    createReq(req)
    setShowNew(false)
    setSelected(req)
    setForm({ status: 'draft', priority: 'medium', tags: [] })
  }

  function handleDelete(id: string) {
    removeReq(id)
    if (selected?.id === id) setSelected(null)
  }

  function handleExport(r: Requirement) {
    const md = `# ${r.id}: ${r.title}\n\n**Epic:** ${r.epic}  \n**Status:** ${r.status}  \n**Priority:** ${r.priority}  \n**Author:** ${r.author}  \n**Updated:** ${formatDate(r.updatedAt)}\n\n## Description\n\n${r.description}\n\n## Acceptance Criteria\n\n${r.acceptanceCriteria}`
    downloadMarkdown(r.id, md)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const titleLine = text.split('\n')[0].replace(/^#\s+/, '') || file.name.replace('.md', '')
      const req: Requirement = {
        id: `REQ-${String(requirements.length + 1).padStart(3, '0')}`,
        title: titleLine, epic: '', description: text, acceptanceCriteria: '',
        status: 'draft', priority: 'medium',
        author: 'Imported', assignee: '',
        date: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0],
        tags: [],
      }
      createReq(req)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const filtered = requirements
    .filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.epic.toLowerCase().includes(search.toLowerCase()))
    .filter(r => !filterStatus || r.status === filterStatus)
    .filter(r => !filterEpic || r.epic === filterEpic)
    .sort((a, b) => {
      const va = a[sortKey] ?? ''; const vb = b[sortKey] ?? ''
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })

  const SortIcon = ({ k }: { k: keyof Requirement }) =>
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
              placeholder="Search requirements..." className="w-full text-xs border border-gray-200 rounded-md pl-7 pr-3 py-1.5 outline-none focus:border-blue-400" />
          </div>
          <div className="flex gap-2">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none">
              <option value="">All</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterEpic} onChange={e => setFilterEpic(e.target.value)}
              className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none">
              <option value="">All Epics</option>
              {epics.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowNew(true)}
              className="flex-1 flex items-center justify-center gap-1 text-xs bg-blue-600 text-white rounded-md py-1.5 hover:bg-blue-700">
              <Plus size={12} />New Req
            </button>
            <label className="flex items-center justify-center gap-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 hover:bg-gray-50 cursor-pointer">
              <Upload size={12} />.md
              <input type="file" accept=".md,.txt" className="hidden" onChange={handleImport} />
            </label>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No requirements.</div>
          ) : filtered.map(r => (
            <button key={r.id} onClick={() => setSelected(r)}
              className={`w-full text-left p-3 hover:bg-blue-50 transition-colors ${selected?.id === r.id ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-gray-400">{r.id}</span>
                <Badge value={r.status} />
                <Badge value={r.priority} type="priority" />
              </div>
              <p className="text-xs font-medium text-gray-900 line-clamp-2">{r.title}</p>
              {r.epic && <p className="text-[11px] text-blue-500 mt-0.5">{r.epic}</p>}
              <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(r.updatedAt)}</p>
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
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-mono text-gray-400">{selected.id}</span>
                  <Badge value={selected.status} />
                  <Badge value={selected.priority} type="priority" />
                </div>
                <h2 className="font-semibold text-gray-900">{selected.title}</h2>
                <p className="text-xs text-gray-400">{selected.epic} · {selected.author} · Updated {formatDate(selected.updatedAt)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleExport(selected)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400" title="Export .md"><Download size={14} /></button>
                <button onClick={() => setEditing({ ...selected })} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400" title="Edit"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(selected.id)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500" title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
                <MarkdownViewer content={selected.description} />
              </section>
              {selected.acceptanceCriteria && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Acceptance Criteria</h3>
                  <MarkdownViewer content={selected.acceptanceCriteria} />
                </section>
              )}
              {selected.tags.length > 0 && (
                <div className="flex gap-1">{selected.tags.map(t => <TagBadge key={t} tag={t} />)}</div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Update Status</label>
                <div className="flex gap-2">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => {
                      const updated = { ...selected, status: s as RequirementStatus }
                      updateReq(updated)
                      setSelected(updated)
                    }}
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
            <div className="text-center"><p className="text-4xl mb-2">📋</p><p className="text-sm">Select a requirement to view</p></div>
          </div>
        )}
      </div>

      {/* New Req Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Requirement" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-700 block mb-1">Title *</label>
              <input value={form.title ?? ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. User can submit an idea with title and description"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Epic</label>
              <input value={form.epic ?? ''} onChange={e => setForm(p => ({ ...p, epic: e.target.value }))}
                placeholder="e.g. Ideas Management"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as Priority }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Description (Markdown)</label>
            <MarkdownEditor value={form.description ?? ''} onChange={v => setForm(p => ({ ...p, description: v }))}
              placeholder="## Overview\n\n## User Story\nAs a [role], I want to [goal] so that [reason].\n\n## Details" minRows={8} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Acceptance Criteria (Markdown)</label>
            <MarkdownEditor value={form.acceptanceCriteria ?? ''} onChange={v => setForm(p => ({ ...p, acceptanceCriteria: v }))}
              placeholder="- [ ] Criterion 1\n- [ ] Criterion 2" minRows={5} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Author</label>
              <input value={form.author ?? ''} onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
                placeholder="e.g. BA Team" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Assignee</label>
              <input value={form.assignee ?? ''} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))}
                placeholder="e.g. Dev Team" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleCreate} disabled={!form.title}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              Create Requirement
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      {editing && (
        <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Requirement" size="xl">
          <div className="space-y-4">
            <input value={editing.title} onChange={e => setEditing(p => p ? { ...p, title: e.target.value } : p)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            <MarkdownEditor value={editing.description} onChange={v => setEditing(p => p ? { ...p, description: v } : p)} minRows={8} />
            <MarkdownEditor value={editing.acceptanceCriteria} onChange={v => setEditing(p => p ? { ...p, acceptanceCriteria: v } : p)} minRows={5} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => {
                const updated = { ...editing, updatedAt: new Date().toISOString().split('T')[0] }
                save(updated); setSelected(updated); setEditing(null)
              }} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
