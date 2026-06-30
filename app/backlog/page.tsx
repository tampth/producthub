'use client'

import { useState } from 'react'
import { Plus, Search, Download, ChevronUp, ChevronDown } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { TagBadge } from '@/components/ui/Badge'
import { formatDate, downloadMarkdown, generateId } from '@/lib/utils'
import { useObsidian } from '@/lib/hooks/useObsidian'
import { BacklogItem, BacklogStatus, BacklogType, Priority } from '@/lib/types'
import { cn } from '@/lib/utils'

const TYPES: BacklogType[] = ['epic', 'story', 'task', 'bug']
const STATUSES: BacklogStatus[] = ['backlog', 'todo', 'in-progress', 'done', 'blocked']
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical']

const TYPE_COLORS: Record<BacklogType, string> = {
  epic: 'bg-purple-100 text-purple-700',
  story: 'bg-blue-100 text-blue-700',
  task: 'bg-gray-100 text-gray-700',
  bug: 'bg-red-100 text-red-700',
}

const SPRINT_COLORS: Record<string, string> = {}
const SPRINT_COLOR_LIST = ['bg-indigo-50 text-indigo-700', 'bg-teal-50 text-teal-700', 'bg-pink-50 text-pink-700']

function getSprintColor(sprint: string) {
  if (!SPRINT_COLORS[sprint]) {
    SPRINT_COLORS[sprint] = SPRINT_COLOR_LIST[Object.keys(SPRINT_COLORS).length % SPRINT_COLOR_LIST.length]
  }
  return SPRINT_COLORS[sprint]
}

export default function BacklogPage() {
  const { items: backlogItems, loading, create: createItem, update: updateItem, remove: removeItem } = useObsidian<BacklogItem>('backlog')
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSprint, setFilterSprint] = useState('')
  const [sortKey, setSortKey] = useState<keyof BacklogItem>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState<BacklogItem | null>(null)
  const [form, setForm] = useState<Partial<BacklogItem>>({ type: 'story', status: 'backlog', priority: 'medium', tags: [], estimate: 0 })

  const sprints = [...new Set(backlogItems.map(i => i.sprint).filter(Boolean))]

  function handleSort(key: keyof BacklogItem) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function handleCreate() {
    const item: BacklogItem = {
      id: generateId(), title: form.title ?? '', description: form.description ?? '',
      type: form.type ?? 'story', status: form.status ?? 'backlog', priority: form.priority ?? 'medium',
      sprint: form.sprint ?? '', estimate: form.estimate ?? 0, assignee: form.assignee ?? '',
      epic: form.epic ?? '', date: new Date().toISOString().split('T')[0], tags: form.tags ?? [],
    }
    createItem(item)
    setShowNew(false)
    setForm({ type: 'story', status: 'backlog', priority: 'medium', tags: [], estimate: 0 })
  }

  function handleStatusChange(id: string, status: BacklogStatus) {
    const item = backlogItems.find(i => i.id === id)
    if (!item) return
    const updated = { ...item, status }
    updateItem(updated)
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : s)
  }

  function handleExport() {
    const rows = filtered.map(i =>
      `| ${i.id} | ${i.title} | ${i.type} | ${i.status} | ${i.priority} | ${i.sprint} | ${i.estimate}pt | ${i.assignee} |`
    ).join('\n')
    const md = `# Backlog Export\n\n| ID | Title | Type | Status | Priority | Sprint | Estimate | Assignee |\n|---|---|---|---|---|---|---|---|\n${rows}`
    downloadMarkdown('backlog-export', md)
  }

  const filtered = backlogItems
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()))
    .filter(i => !filterType || i.type === filterType)
    .filter(i => !filterStatus || i.status === filterStatus)
    .filter(i => !filterSprint || i.sprint === filterSprint)
    .sort((a, b) => {
      const va = a[sortKey] ?? ''; const vb = b[sortKey] ?? ''
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })

  const SortIcon = ({ k }: { k: keyof BacklogItem }) =>
    sortKey === k ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-sm text-gray-400">Loading...</div>
  }

  return (
    <div className="space-y-4">
      {/* View toggle + Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(['table', 'kanban'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn('px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize',
                view === v ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700')}>
              {v === 'table' ? '☰ Table' : '⬛ Kanban'}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search backlog..." className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 w-48" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 text-gray-600">
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 text-gray-600">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterSprint} onChange={e => setFilterSprint(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 text-gray-600">
          <option value="">All Sprints</option>
          {sprints.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="ml-auto flex gap-2">
          <button onClick={handleExport}
            className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 text-gray-600">
            <Download size={14} /> Export .md
          </button>
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 text-sm bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700">
            <Plus size={14} /> Add Item
          </button>
        </div>
      </div>

      {/* Table View */}
      {view === 'table' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="airtable-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('type')} className="w-20">Type <SortIcon k="type" /></th>
                  <th onClick={() => handleSort('title')} className="w-80">Title <SortIcon k="title" /></th>
                  <th onClick={() => handleSort('status')}>Status <SortIcon k="status" /></th>
                  <th onClick={() => handleSort('priority')}>Priority <SortIcon k="priority" /></th>
                  <th onClick={() => handleSort('sprint')}>Sprint <SortIcon k="sprint" /></th>
                  <th onClick={() => handleSort('estimate')}>Pts <SortIcon k="estimate" /></th>
                  <th onClick={() => handleSort('assignee')}>Assignee <SortIcon k="assignee" /></th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No backlog items found.</td></tr>
                ) : filtered.map(item => (
                  <tr key={item.id} className="cursor-pointer" onClick={() => setSelected(item)}>
                    <td>
                      <span className={cn('badge text-[11px]', TYPE_COLORS[item.type])}>{item.type}</span>
                    </td>
                    <td>
                      <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.title}</p>
                      {item.epic && <p className="text-[11px] text-gray-400 mt-0.5">↳ {item.epic}</p>}
                    </td>
                    <td><Badge value={item.status} /></td>
                    <td><Badge value={item.priority} type="priority" /></td>
                    <td>
                      {item.sprint ? <span className={cn('badge text-[11px]', getSprintColor(item.sprint))}>{item.sprint}</span> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="text-sm font-mono text-center text-gray-700">{item.estimate || '—'}</td>
                    <td className="text-sm text-gray-600">{item.assignee || <span className="text-gray-300">—</span>}</td>
                    <td><div className="flex gap-1 flex-wrap">{item.tags.map(t => <TagBadge key={t} tag={t} />)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 flex gap-4">
            <span>{filtered.length} items</span>
            <span>{filtered.reduce((s, i) => s + (i.estimate || 0), 0)} pts total</span>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map(status => {
            const cols = filtered.filter(i => i.status === status)
            return (
              <div key={status} className="flex-shrink-0 w-64">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge value={status} />
                    <span className="text-xs text-gray-400">{cols.length}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {cols.map(item => (
                    <div key={item.id} onClick={() => setSelected(item)}
                      className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={cn('badge text-[10px]', TYPE_COLORS[item.type])}>{item.type}</span>
                        <Badge value={item.priority} type="priority" />
                      </div>
                      <p className="text-xs font-medium text-gray-900 line-clamp-2">{item.title}</p>
                      {item.assignee && <p className="text-[11px] text-gray-400 mt-1.5">{item.assignee}</p>}
                      {item.estimate > 0 && <p className="text-[11px] text-gray-400">{item.estimate}pt · {item.sprint}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={selected.title} size="lg">
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <span className={cn('badge', TYPE_COLORS[selected.type])}>{selected.type}</span>
              <Badge value={selected.status} />
              <Badge value={selected.priority} type="priority" />
              {selected.sprint && <span className={cn('badge', getSprintColor(selected.sprint))}>{selected.sprint}</span>}
              {selected.estimate > 0 && <span className="badge bg-gray-100 text-gray-700">{selected.estimate} pts</span>}
            </div>
            {selected.description && <p className="text-sm text-gray-700">{selected.description}</p>}
            {selected.epic && <p className="text-xs text-gray-500"><strong>Epic:</strong> {selected.epic}</p>}
            {selected.assignee && <p className="text-xs text-gray-500"><strong>Assignee:</strong> {selected.assignee}</p>}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Move to</label>
              <div className="flex gap-2 flex-wrap">
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
        </Modal>
      )}

      {/* New Item Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Add Backlog Item" size="md">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Title *</label>
            <input value={form.title ?? ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. As a user, I can..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Description</label>
            <textarea value={form.description ?? ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-y" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as BacklogType }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as BacklogStatus }))}
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
              <label className="text-xs font-medium text-gray-700 block mb-1">Estimate (pts)</label>
              <input type="number" value={form.estimate ?? 0} onChange={e => setForm(p => ({ ...p, estimate: Number(e.target.value) }))}
                min={0} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Sprint</label>
              <input value={form.sprint ?? ''} onChange={e => setForm(p => ({ ...p, sprint: e.target.value }))}
                placeholder="e.g. Sprint 23" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Assignee</label>
              <input value={form.assignee ?? ''} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))}
                placeholder="Assignee name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleCreate} disabled={!form.title}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Add Item</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
