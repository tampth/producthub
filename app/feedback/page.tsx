'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { formatDate, generateId } from '@/lib/utils'
import { FeedbackItem } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useObsidian } from '@/lib/hooks/useObsidian'

const CATEGORIES = ['Positive', 'Feature Request', 'Process Improvement', 'Bug/Issue', 'Other']

function FeedbackContent() {
  const searchParams = useSearchParams()
  const { items, loading, create, update } = useObsidian<FeedbackItem>('feedback')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showNew, setShowNew] = useState(searchParams.get('new') === '1')
  const [form, setForm] = useState<Partial<FeedbackItem>>({ category: 'Feature Request' })

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Đang tải...</div>

  function handleCreate() {
    const item: FeedbackItem = {
      id: generateId(), title: form.title ?? '', content: form.content ?? '',
      submitter: form.submitter ?? 'Anonymous', date: new Date().toISOString().split('T')[0],
      category: form.category ?? 'Other', status: 'new',
    }
    create(item)
    setShowNew(false)
    setForm({ category: 'Feature Request' })
  }

  function handleStatusChange(id: string, status: FeedbackItem['status']) {
    const item = items.find(i => i.id === id)
    if (item) update({ ...item, status })
  }

  const filtered = items
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.content.toLowerCase().includes(search.toLowerCase()))
    .filter(i => !filterStatus || i.status === filterStatus)

  return (
    <div className="max-w-4xl space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {(['new', 'acknowledged', 'addressed'] as const).map(s => (
          <div key={s} className={cn('bg-white border rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50',
            filterStatus === s ? 'border-blue-400 bg-blue-50' : 'border-gray-200')}
            onClick={() => setFilterStatus(prev => prev === s ? '' : s)}>
            <p className="text-2xl font-bold text-gray-900">{items.filter(i => i.status === s).length}</p>
            <p className="text-xs text-gray-500 capitalize mt-0.5">{s}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search feedback..." className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none text-gray-600">
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="addressed">Addressed</option>
        </select>
        <div className="ml-auto">
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 text-sm bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">
            <Plus size={14} /> Give Feedback
          </button>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">
            No feedback found. Be the first to share!
          </div>
        ) : filtered.map(item => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge value={item.status} />
                  <span className="badge bg-gray-100 text-gray-600">{item.category}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.content}</p>
                <p className="text-xs text-gray-400 mt-2">{item.submitter} · {formatDate(item.date)}</p>
              </div>
              <div className="flex flex-col gap-1">
                {(['new', 'acknowledged', 'addressed'] as const).filter(s => s !== item.status).map(s => (
                  <button key={s} onClick={() => handleStatusChange(item.id, s)}
                    className="text-xs px-2 py-1 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 whitespace-nowrap">
                    Mark {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Feedback Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="💬 Give Feedback" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Title *</label>
            <input value={form.title ?? ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Brief summary of your feedback"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Feedback *</label>
            <textarea value={form.content ?? ''} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              rows={5} placeholder="Share your thoughts, suggestions, or concerns..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-y" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Your Name / Team</label>
              <input value={form.submitter ?? ''} onChange={e => setForm(p => ({ ...p, submitter: e.target.value }))}
                placeholder="e.g. Ops Team" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleCreate} disabled={!form.title || !form.content}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Submit Feedback</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeedbackContent />
    </Suspense>
  )
}
