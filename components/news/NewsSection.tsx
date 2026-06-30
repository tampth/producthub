'use client'

import { useState } from 'react'
import { Plus, Download, Upload, Edit2, Trash2, Pin, Search } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { MarkdownEditor } from '@/components/ui/MarkdownEditor'
import { MarkdownViewer } from '@/components/ui/MarkdownViewer'
import { formatDate, downloadMarkdown, generateId } from '@/lib/utils'
import { NewsArticle } from '@/lib/types'
import { useObsidian } from '@/lib/hooks/useObsidian'

interface NewsSectionProps {
  category: NewsArticle['category']
  title: string
  icon: React.ReactNode
  color: string
}

export function NewsSection({ category, title, icon, color }: NewsSectionProps) {
  const { items: allNews, loading, create: createArticle, update: updateArticle, remove: removeArticle } = useObsidian<NewsArticle>('news')
  const articles = allNews.filter(a => a.category === category)
  const [selected, setSelected] = useState<NewsArticle | null>(null)
  const [editing, setEditing] = useState<NewsArticle | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [search, setSearch] = useState('')
  const [newArticle, setNewArticle] = useState({ title: '', content: '', pinned: false })

  function save(article: NewsArticle) {
    const exists = allNews.some(a => a.id === article.id)
    if (exists) updateArticle(article)
    else createArticle(article)
    setEditing(null)
    setSelected(article)
  }

  function deleteArticle(id: string) {
    removeArticle(id)
    if (selected?.id === id) setSelected(null)
  }

  function handleCreate() {
    const article: NewsArticle = {
      id: generateId(), ...newArticle, category,
      date: new Date().toISOString().split('T')[0],
      author: 'Product Ops', tags: [],
    }
    save(article)
    setNewArticle({ title: '', content: '', pinned: false })
    setShowNew(false)
    setSelected(article)
  }

  function handleExport(article: NewsArticle) {
    downloadMarkdown(article.title, `# ${article.title}\n\n> ${formatDate(article.date)} · ${article.author}\n\n${article.content}`)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const titleLine = text.split('\n')[0].replace(/^#\s+/, '') || file.name.replace('.md', '')
      const content = text.split('\n').slice(1).join('\n').trim()
      const article: NewsArticle = {
        id: generateId(), title: titleLine, content, category,
        date: new Date().toISOString().split('T')[0],
        author: 'Imported', pinned: false, tags: [],
      }
      save(article)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const filtered = articles
    .filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="flex gap-4 h-[calc(100vh-130px)]">
      {/* Article list */}
      <div className="w-72 flex-shrink-0 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-gray-100 space-y-2">
          <div className="flex items-center gap-2">
            <span className={color}>{icon}</span>
            <span className="font-semibold text-sm text-gray-900">{title}</span>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search..." className="w-full text-xs border border-gray-200 rounded-md pl-7 pr-3 py-1.5 outline-none focus:border-blue-400" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowNew(true)}
              className="flex-1 flex items-center justify-center gap-1 text-xs bg-blue-600 text-white rounded-md py-1.5 hover:bg-blue-700">
              <Plus size={12} />New
            </button>
            <label className="flex items-center justify-center gap-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 hover:bg-gray-50 cursor-pointer">
              <Upload size={12} />.md
              <input type="file" accept=".md,.txt" className="hidden" onChange={handleImport} />
            </label>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {loading ? (
            <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No articles yet.<br />Create one!</div>
          ) : filtered.map(a => (
            <button key={a.id} onClick={() => setSelected(a)}
              className={`w-full text-left p-3 hover:bg-blue-50 transition-colors ${selected?.id === a.id ? 'bg-blue-50' : ''}`}>
              <div className="flex items-start gap-1.5">
                {a.pinned && <Pin size={11} className="text-orange-500 mt-0.5 flex-shrink-0" />}
                <p className="text-xs font-medium text-gray-900 line-clamp-2">{a.title}</p>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">{formatDate(a.date)} · {a.author}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Article viewer */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
        {selected ? (
          <>
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-900">{selected.title}</h2>
                <p className="text-xs text-gray-400">{formatDate(selected.date)} · {selected.author}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => save({ ...selected, pinned: !selected.pinned })}
                  className={`p-1.5 rounded-md hover:bg-gray-100 ${selected.pinned ? 'text-orange-500' : 'text-gray-400'}`} title="Pin">
                  <Pin size={14} />
                </button>
                <button onClick={() => handleExport(selected)}
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400" title="Export .md">
                  <Download size={14} />
                </button>
                <button onClick={() => setEditing(selected)}
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400" title="Edit">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => deleteArticle(selected.id)}
                  className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <MarkdownViewer content={selected.content} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-4xl mb-2">📄</p>
              <p className="text-sm">Select an article to read</p>
            </div>
          </div>
        )}
      </div>

      {/* New Article Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title={`New ${title} Article`} size="lg">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Title</label>
            <input value={newArticle.title} onChange={e => setNewArticle(p => ({ ...p, title: e.target.value }))}
              placeholder="Article title..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Content (Markdown)</label>
            <MarkdownEditor value={newArticle.content} onChange={v => setNewArticle(p => ({ ...p, content: v }))}
              placeholder="# Write your article in Markdown..." minRows={12} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={newArticle.pinned} onChange={e => setNewArticle(p => ({ ...p, pinned: e.target.checked }))} />
            Pin this article to the top
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleCreate} disabled={!newArticle.title} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              Create Article
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      {editing && (
        <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Article" size="lg">
          <div className="space-y-4">
            <input value={editing.title} onChange={e => setEditing(p => p ? { ...p, title: e.target.value } : p)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            <MarkdownEditor value={editing.content} onChange={v => setEditing(p => p ? { ...p, content: v } : p)} minRows={14} />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => { save(editing); setSelected(editing); setEditing(null) }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
