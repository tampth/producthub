'use client'

import { useState } from 'react'
import { CalendarDays, ExternalLink, Video, Plus, Clock } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { formatDate, generateId } from '@/lib/utils'
import { DemoMeeting } from '@/lib/types'
import { useObsidian } from '@/lib/hooks/useObsidian'

export default function DemosPage() {
  const { items: demos, loading, create } = useObsidian<DemoMeeting>('demos')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<Partial<DemoMeeting>>({ agenda: [] })

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Đang tải...</div>

  const today = new Date().toISOString().split('T')[0]
  const upcoming = demos.filter(d => d.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  const past = demos.filter(d => d.date < today).sort((a, b) => b.date.localeCompare(a.date))

  function handleCreate() {
    const demo: DemoMeeting = {
      id: generateId(), title: form.title ?? '', date: form.date ?? today,
      time: form.time ?? '14:00', link: form.link ?? '', description: form.description ?? '',
      agenda: form.agenda ?? [], recording: form.recording ?? '',
    }
    create(demo)
    setShowNew(false)
    setForm({ agenda: [] })
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 text-sm bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">
          <Plus size={14} /> Schedule Demo
        </button>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Upcoming Meetings</h2>
        {upcoming.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
            No upcoming meetings scheduled.
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(demo => <DemoCard key={demo.id} demo={demo} upcoming />)}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Past Meetings</h2>
          <div className="space-y-3">
            {past.map(demo => <DemoCard key={demo.id} demo={demo} />)}
          </div>
        </section>
      )}

      {/* New Demo Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Schedule Demo Meeting" size="md">
        <div className="space-y-3">
          {[
            { label: 'Title *', key: 'title', type: 'text', placeholder: 'e.g. Sprint 23 Demo' },
            { label: 'Description', key: 'description', type: 'textarea', placeholder: 'What will be demoed?' },
            { label: 'Meeting Link', key: 'link', type: 'text', placeholder: 'https://meet.google.com/...' },
            { label: 'Recording Link (optional)', key: 'recording', type: 'text', placeholder: 'https://drive.google.com/...' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-gray-700 block mb-1">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea value={(form as Record<string, string>)[f.key] ?? ''}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} rows={3}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-y" />
              ) : (
                <input value={(form as Record<string, string>)[f.key] ?? ''}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
              )}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Date *</label>
              <input type="date" value={form.date ?? today} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Time</label>
              <input type="time" value={form.time ?? '14:00'} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleCreate} disabled={!form.title}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Schedule</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function DemoCard({ demo, upcoming }: { demo: DemoMeeting; upcoming?: boolean }) {
  return (
    <div className={`bg-white border rounded-xl p-5 ${upcoming ? 'border-blue-200 shadow-sm' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {upcoming && <span className="badge bg-blue-100 text-blue-700">Upcoming</span>}
            {demo.recording && <span className="badge bg-green-100 text-green-700"><Video size={10} className="inline mr-0.5" />Recording Available</span>}
          </div>
          <h3 className="font-semibold text-gray-900">{demo.title}</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1"><CalendarDays size={13} />{formatDate(demo.date)}</span>
            <span className="flex items-center gap-1"><Clock size={13} />{demo.time}</span>
          </div>
          {demo.description && <p className="text-sm text-gray-600 mt-2">{demo.description}</p>}
          {demo.agenda.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Agenda</p>
              <ul className="space-y-0.5">
                {demo.agenda.map((item, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-medium">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {demo.link && (
            <a href={demo.link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700 whitespace-nowrap">
              <ExternalLink size={12} /> Join Meeting
            </a>
          )}
          {demo.recording && (
            <a href={demo.recording} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-gray-600 whitespace-nowrap">
              <Video size={12} /> Watch Recording
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
