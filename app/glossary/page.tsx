'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { generateId } from '@/lib/utils'
import { useObsidian } from '@/lib/hooks/useObsidian'

interface GlossaryTerm {
  id: string
  term: string
  definition: string
  category: string
  example?: string
}

const CATEGORIES = ['All', 'Product', 'Engineering', 'Agile', 'QA', 'Ops', 'Roles']

export default function GlossaryPage() {
  const { items: terms, loading, create } = useObsidian<GlossaryTerm>('glossary')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<Partial<GlossaryTerm>>({})

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Đang tải...</div>

  function handleCreate() {
    const term: GlossaryTerm = {
      id: generateId(), term: form.term ?? '', definition: form.definition ?? '',
      category: form.category ?? 'Product', example: form.example,
    }
    create(term)
    setShowNew(false)
    setForm({})
  }

  const filtered = terms
    .filter(t => category === 'All' || t.category === category)
    .filter(t => !search || t.term.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.term.localeCompare(b.term))

  const grouped = filtered.reduce((acc, t) => {
    const letter = t.term[0].toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(t)
    return acc
  }, {} as Record<string, GlossaryTerm[]>)

  return (
    <div className="max-w-4xl space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search terms..." className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400" />
        </div>
        <div className="flex gap-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${category === c ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 text-sm bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">
            <Plus size={14} /> Add Term
          </button>
        </div>
      </div>

      {/* Glossary */}
      <div className="space-y-4">
        {Object.keys(grouped).sort().map(letter => (
          <div key={letter}>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-bold flex items-center justify-center">{letter}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="grid grid-cols-1 gap-2">
              {grouped[letter].map(term => (
                <div key={term.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{term.term}</h3>
                        <span className="badge bg-gray-100 text-gray-600">{term.category}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{term.definition}</p>
                      {term.example && (
                        <p className="text-xs text-gray-400 mt-2 italic">Example: {term.example}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">
            No terms found.
          </div>
        )}
      </div>

      {/* New Term Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Add Glossary Term" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Term *</label>
              <input value={form.term ?? ''} onChange={e => setForm(p => ({ ...p, term: e.target.value }))}
                placeholder="e.g. PRD" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Category</label>
              <select value={form.category ?? 'Product'} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Definition *</label>
            <textarea value={form.definition ?? ''} onChange={e => setForm(p => ({ ...p, definition: e.target.value }))}
              rows={4} placeholder="Clear and concise definition..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-y" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Example (optional)</label>
            <input value={form.example ?? ''} onChange={e => setForm(p => ({ ...p, example: e.target.value }))}
              placeholder="Usage example..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleCreate} disabled={!form.term || !form.definition}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Add Term</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
