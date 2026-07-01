'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  CheckSquare, Plus, Search, X, Link2, Download,
  ChevronRight, Clock, Calendar, User,
} from 'lucide-react'
import { useObsidian } from '@/lib/hooks/useObsidian'
import { Task, TaskStatus, Priority } from '@/lib/types'
import { formatDate } from '@/lib/utils'

const STATUS_CFG: Record<TaskStatus, { label: string; cls: string; activeCls: string }> = {
  'open':        { label: 'Open',        cls: 'bg-blue-100 text-blue-700',   activeCls: 'border-transparent bg-blue-100 text-blue-700 font-medium' },
  'in-progress': { label: 'In Progress', cls: 'bg-amber-100 text-amber-700', activeCls: 'border-transparent bg-amber-100 text-amber-700 font-medium' },
  'done':        { label: 'Done',        cls: 'bg-green-100 text-green-700', activeCls: 'border-transparent bg-green-100 text-green-700 font-medium' },
  'blocked':     { label: 'Blocked',     cls: 'bg-red-100 text-red-700',     activeCls: 'border-transparent bg-red-100 text-red-700 font-medium' },
  'cancelled':   { label: 'Cancelled',   cls: 'bg-gray-100 text-gray-500',   activeCls: 'border-transparent bg-gray-100 text-gray-500 font-medium' },
}

const PRIORITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-400',
  medium:   'bg-yellow-400',
  low:      'bg-gray-300',
}

const STATUS_OPTIONS: TaskStatus[] = ['open', 'in-progress', 'done', 'blocked', 'cancelled']
const PRIORITY_OPTIONS: Priority[] = ['critical', 'high', 'medium', 'low']

const NEW_TEMPLATE = `## Nội dung / Description


## Checklist
- [ ]
- [ ]

## Updates
`

function toAssignees(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String)
  if (typeof v === 'string' && v) return [v]
  return []
}

function nextId(items: Task[]): string {
  const nums = items
    .map(t => parseInt(t.id.match(/TASK-\w+-(\d+)/)?.[1] ?? '0'))
    .filter(n => !isNaN(n))
  return `TASK-CC-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(2, '0')}`
}

function appendUpdate(desc: string, author: string, text: string): string {
  const today = new Date().toISOString().slice(0, 10)
  const entry = `\n- **${today}** \`${author}\` — ${text}`
  if (desc.includes('## Updates')) return desc + entry
  return desc + '\n\n## Updates' + entry
}

// Renders markdown with interactive GFM checkboxes.
// cbIdx must be a closure-captured let so it resets on every render and each
// checkbox captures its own stable index at render time.
function TaskMarkdownViewer({
  content,
  onToggle,
}: {
  content: string
  onToggle: (newContent: string) => void
}) {
  let cbIdx = 0
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 prose-headings:mt-4 prose-headings:mb-2"
      components={{
        input: ({ checked }) => {
          const idx = cbIdx++
          return (
            <input
              type="checkbox"
              checked={!!checked}
              onChange={() => {
                let count = 0
                const updated = content
                  .split('\n')
                  .map(line => {
                    if (/^\s*-\s\[[ x]\]/.test(line)) {
                      if (count++ === idx) {
                        return line.replace(/\[([ x])\]/, (_, s) => (s === ' ' ? '[x]' : '[ ]'))
                      }
                    }
                    return line
                  })
                  .join('\n')
                onToggle(updated)
              }}
              className="cursor-pointer w-4 h-4 accent-blue-600 mr-1 align-middle"
            />
          )
        },
        li: ({ className, children, ...props }: React.HTMLAttributes<HTMLLIElement> & { className?: string }) => (
          <li
            className={
              className === 'task-list-item'
                ? 'list-none flex items-baseline gap-1 leading-relaxed'
                : undefined
            }
            {...props}
          >
            {children}
          </li>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

function TasksPageContent() {
  const { items, loading, create, update } = useObsidian<Task>('tasks')
  const searchParams = useSearchParams()
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('')
  const [selected, setSelected] = useState<Task | null>(null)
  const [showNew, setShowNew] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newProduct, setNewProduct] = useState('Call Center')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [newAssignees, setNewAssignees] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newDesc, setNewDesc] = useState(NEW_TEMPLATE)

  const [updateAuthor, setUpdateAuthor] = useState('')
  const [updateText, setUpdateText] = useState('')
  const [posting, setPosting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Deep-link: if ?task=TASK-CC-01 is in the URL, select that task
  useEffect(() => {
    const taskId = searchParams.get('task')
    if (taskId && items.length > 0 && !selected) {
      const found = items.find(t => t.id === taskId)
      if (found) setSelected(found)
    }
  }, [searchParams, items]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    return items.filter(t => {
      if (filterStatus && t.status !== filterStatus) return false
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [items, filterStatus, search])

  function handleSelect(task: Task) {
    setSelected(task)
    router.replace(`/tasks?task=${task.id}`, { scroll: false })
  }

  function handleClose() {
    setSelected(null)
    router.replace('/tasks', { scroll: false })
  }

  function handleCheckboxToggle(newContent: string) {
    if (!selected) return
    const updated = { ...selected, description: newContent }
    setSelected(updated)
    update(updated)
  }

  async function handlePostUpdate() {
    if (!selected || !updateText.trim()) return
    setPosting(true)
    const author = updateAuthor.trim() || 'anonymous'
    const newContent = appendUpdate(selected.description || '', author, updateText.trim())
    const updated = { ...selected, description: newContent }
    setSelected(updated)
    await update(updated)
    setUpdateText('')
    setPosting(false)
  }

  function handleStatusChange(status: TaskStatus) {
    if (!selected) return
    const updated = { ...selected, status }
    setSelected(updated)
    update(updated)
  }

  async function handleCreate() {
    if (!newTitle.trim()) return
    const task: Task = {
      id: nextId(items),
      title: newTitle.trim(),
      status: 'open',
      priority: newPriority,
      product: newProduct.trim() || 'General',
      reporter: 'tampth',
      assignees: newAssignees.split(',').map(s => s.trim()).filter(Boolean),
      date: new Date().toISOString().slice(0, 10),
      dueDate: newDueDate || undefined,
      tags: [],
      description: newDesc,
    }
    await create(task)
    setShowNew(false)
    setNewTitle(''); setNewProduct('Call Center'); setNewPriority('medium')
    setNewAssignees(''); setNewDueDate(''); setNewDesc(NEW_TEMPLATE)
  }

  function handleExport() {
    if (!selected) return
    const assignees = toAssignees(selected.assignees)
    const lines = [
      `# ${selected.title}`,
      '',
      `**ID:** ${selected.id}  |  **Status:** ${selected.status}  |  **Priority:** ${selected.priority}`,
      `**Product:** ${selected.product}  |  **Reporter:** ${selected.reporter}`,
      `**Assignees:** ${assignees.join(', ')}`,
      `**Created:** ${selected.date}${selected.dueDate ? `  |  **Due:** ${selected.dueDate}` : ''}`,
      '',
      selected.description || '',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${selected.id}.md`
    a.click()
  }

  function handleCopyLink() {
    if (!selected) return
    navigator.clipboard.writeText(`${window.location.origin}/tasks?task=${selected.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const assigneesList = selected ? toAssignees(selected.assignees) : []

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md w-52 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as TaskStatus | '')}
            className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{STATUS_CFG[s].label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          <Plus size={14} /> New Task
        </button>
      </div>

      {/* Split */}
      <div className="flex flex-1 min-h-0">
        {/* Left list */}
        <div className="w-72 flex-shrink-0 border-r border-gray-200 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No tasks found.</div>
          ) : (
            filtered.map(task => {
              const isActive = selected?.id === task.id
              const assignees = toAssignees(task.assignees)
              return (
                <button
                  key={task.id}
                  onClick={() => handleSelect(task)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors border-l-2 ${
                    isActive ? 'border-l-blue-500 bg-blue-50' : 'border-l-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${PRIORITY_DOT[task.priority] ?? 'bg-gray-300'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-mono text-[10px] text-gray-400">{task.id}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_CFG[task.status]?.cls ?? 'bg-gray-100 text-gray-500'}`}>
                          {STATUS_CFG[task.status]?.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate leading-snug">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {assignees.slice(0, 3).map(a => (
                          <span key={a} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{a}</span>
                        ))}
                        {task.dueDate && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5 ml-auto">
                            <Calendar size={9} />{task.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Right panel */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-white">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <CheckSquare size={44} strokeWidth={1} className="mb-3 opacity-25" />
              <p className="text-sm">Select a task to view</p>
              <p className="text-xs mt-1 opacity-70">Or share a task link directly with your team</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto px-6 py-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className="font-mono text-xs text-gray-400">{selected.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CFG[selected.status]?.cls}`}>
                      {STATUS_CFG[selected.status]?.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{selected.priority}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{selected.product}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 leading-snug">{selected.title}</h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User size={11} />{selected.reporter}
                    </span>
                    {assigneesList.length > 0 && (
                      <span className="flex items-center gap-1">
                        <ChevronRight size={11} />
                        {assigneesList.map(a => (
                          <span key={a} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">{a}</span>
                        ))}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />{formatDate(selected.date)}
                    </span>
                    {selected.dueDate && (
                      <span className="flex items-center gap-1 text-orange-600 font-medium">
                        <Clock size={11} />Due {formatDate(selected.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={handleCopyLink}
                    title={copied ? 'Copied!' : 'Copy share link'}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs transition-colors ${
                      copied ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    }`}
                  >
                    <Link2 size={13} />
                    {copied ? 'Copied!' : 'Share'}
                  </button>
                  <button onClick={handleExport} title="Export .md"
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <Download size={14} />
                  </button>
                  <button onClick={handleClose} title="Close"
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Status strip */}
              <div className="flex items-center gap-1.5 mb-4">
                <span className="text-xs text-gray-400 mr-0.5">Update status:</span>
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selected.status === s
                        ? STATUS_CFG[s].activeCls
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {STATUS_CFG[s].label}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-100 mb-5" />

              {/* Interactive markdown */}
              <TaskMarkdownViewer
                content={selected.description || ''}
                onToggle={handleCheckboxToggle}
              />

              {/* Post Update */}
              <div className="border-t border-gray-200 mt-6 pt-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Post an Update</h3>
                <div className="flex flex-col gap-2">
                  <input
                    value={updateAuthor}
                    onChange={e => setUpdateAuthor(e.target.value)}
                    placeholder="Your name..."
                    className="w-44 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex gap-2 items-end">
                    <textarea
                      value={updateText}
                      onChange={e => setUpdateText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePostUpdate() }}
                      placeholder="Add a status update or comment... (Ctrl+Enter to post)"
                      rows={2}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={handlePostUpdate}
                      disabled={!updateText.trim() || posting}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {posting ? '...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Task Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="font-semibold text-gray-900">New Task</h2>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
                  <input
                    value={newProduct}
                    onChange={e => setNewProduct(e.target.value)}
                    placeholder="Call Center"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {PRIORITY_OPTIONS.map(p => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Assignees (comma-separated)</label>
                  <input
                    value={newAssignees}
                    onChange={e => setNewAssignees(e.target.value)}
                    placeholder="Nam, Quyên, ..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description (Markdown — dùng - [ ] cho checklist)</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={9}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-40"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TasksPage() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <h1 className="text-xl font-semibold text-gray-900">Tasks</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Track and share task progress — send a link for your team to confirm and update
        </p>
      </div>
      <Suspense fallback={<div className="p-6 text-sm text-gray-400">Loading...</div>}>
        <TasksPageContent />
      </Suspense>
    </div>
  )
}
