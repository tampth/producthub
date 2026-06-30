'use client'

import { useState } from 'react'
import { MarkdownViewer } from './MarkdownViewer'
import { Eye, Edit2 } from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  minRows?: number
}

export function MarkdownEditor({ value, onChange, placeholder, minRows = 10 }: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => setPreview(false)}
          className={`px-3 py-1 text-xs rounded font-medium transition-colors ${!preview ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Edit2 size={12} className="inline mr-1" />Edit
        </button>
        <button
          onClick={() => setPreview(true)}
          className={`px-3 py-1 text-xs rounded font-medium transition-colors ${preview ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Eye size={12} className="inline mr-1" />Preview
        </button>
        <span className="ml-auto text-xs text-gray-400">Supports **Markdown**</span>
      </div>

      {preview ? (
        <div className="p-4 min-h-[200px]">
          {value ? <MarkdownViewer content={value} /> : <p className="text-gray-400 text-sm italic">Nothing to preview</p>}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? 'Write in Markdown...'}
          rows={minRows}
          className="w-full p-4 text-sm font-mono resize-y outline-none text-gray-900 placeholder-gray-400 bg-white"
        />
      )}
    </div>
  )
}
