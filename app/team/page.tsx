'use client'

import { useState, useMemo } from 'react'
import { Search, Phone, Mail, ChevronUp, ChevronDown, Users } from 'lucide-react'
import { useObsidian } from '@/lib/hooks/useObsidian'
import { TeamMember } from '@/lib/types'

const DEPARTMENTS = ['Tất cả', 'BĐH', 'VẬN HÀNH', 'WEB-APP ADMIN', 'MEDIA', 'SEO', 'P.MKT', 'CONTENT', 'PRODUCT', 'DESIGN', 'CX', 'GS', 'Growth']

const DEPT_COLORS: Record<string, string> = {
  'BĐH': 'bg-purple-100 text-purple-800',
  'VẬN HÀNH': 'bg-blue-100 text-blue-800',
  'WEB-APP ADMIN': 'bg-cyan-100 text-cyan-800',
  'MEDIA': 'bg-pink-100 text-pink-800',
  'SEO': 'bg-orange-100 text-orange-800',
  'P.MKT': 'bg-yellow-100 text-yellow-800',
  'CONTENT': 'bg-green-100 text-green-800',
  'PRODUCT': 'bg-indigo-100 text-indigo-800',
  'DESIGN': 'bg-rose-100 text-rose-800',
  'CX': 'bg-teal-100 text-teal-800',
  'GS': 'bg-amber-100 text-amber-800',
  'Growth': 'bg-emerald-100 text-emerald-800',
}

function avatarColor(team: string) {
  const colors: Record<string, string> = {
    'BĐH': 'bg-purple-500', 'VẬN HÀNH': 'bg-blue-500', 'WEB-APP ADMIN': 'bg-cyan-500',
    'MEDIA': 'bg-pink-500', 'SEO': 'bg-orange-500', 'P.MKT': 'bg-yellow-500',
    'CONTENT': 'bg-green-500', 'PRODUCT': 'bg-indigo-500', 'DESIGN': 'bg-rose-500',
    'CX': 'bg-teal-500', 'GS': 'bg-amber-500', 'Growth': 'bg-emerald-500',
  }
  return colors[team] ?? 'bg-gray-500'
}

type SortKey = 'name' | 'role' | 'team' | 'office' | 'gender'
type SortDir = 'asc' | 'desc'

function getDept(m: TeamMember) { return m.department ?? m.team ?? '' }
function getAvatar(m: TeamMember) {
  if (m.avatar) return m.avatar
  const parts = m.name.trim().split(' ')
  return parts.length >= 2 ? (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase() : m.name.slice(0, 2).toUpperCase()
}

export default function TeamPage() {
  const { items: allMembers, loading } = useObsidian<TeamMember>('team')
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('Tất cả')
  const [sortKey, setSortKey] = useState<SortKey>('team')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selected, setSelected] = useState<TeamMember | null>(null)
  const [view, setView] = useState<'table' | 'card'>('table')

  const filtered = useMemo(() => {
    let list = allMembers
    if (dept !== 'Tất cả') list = list.filter(m => getDept(m) === dept)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone ?? '').includes(q)
      )
    }
    return [...list].sort((a, b) => {
      const av = (a[sortKey] ?? getDept(a)).toString().toLowerCase()
      const bv = (b[sortKey] ?? getDept(b)).toString().toLowerCase()
      return sortDir === 'asc' ? av.localeCompare(bv, 'vi') : bv.localeCompare(av, 'vi')
    })
  }, [allMembers, search, dept, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-20" />
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-600" /> : <ChevronDown className="w-3 h-3 text-blue-600" />
  }

  const deptCounts = useMemo(() => {
    const map: Record<string, number> = {}
    allMembers.forEach(m => { const d = getDept(m); map[d] = (map[d] ?? 0) + 1 })
    return map
  }, [allMembers])

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Đang tải danh bạ...</div>

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Danh bạ nhân sự</h1>
            <p className="text-sm text-gray-500 mt-0.5">Ecom Long Châu — {allMembers.length} thành viên</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${view === 'table' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
              Bảng
            </button>
            <button
              onClick={() => setView('card')}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${view === 'card' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
              Thẻ
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tên, vai trò, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={dept}
            onChange={e => setDept(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>
                {d === 'Tất cả' ? `Tất cả (${allMembers.length})` : `${d} (${deptCounts[d] ?? 0})`}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500 self-center">{filtered.length} kết quả</span>
        </div>
      </div>

      {/* Department chips */}
      <div className="px-6 py-2 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-2">
        {DEPARTMENTS.filter(d => d !== 'Tất cả').map(d => (
          <button
            key={d}
            onClick={() => setDept(dept === d ? 'Tất cả' : d)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
              dept === d ? 'ring-2 ring-offset-1 ring-blue-400 ' : 'border-transparent'
            } ${DEPT_COLORS[d] ?? 'bg-gray-100 text-gray-700'}`}
          >
            <Users className="w-3 h-3" />
            {d}
            <span className="font-semibold">{deptCounts[d] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {view === 'table' ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="w-8 px-4 py-3 text-left text-xs font-medium text-gray-500">#</th>
                <th className="px-4 py-3 text-left">
                  <button className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900" onClick={() => toggleSort('name')}>
                    Họ tên <SortIcon col="name" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900" onClick={() => toggleSort('role')}>
                    Chức danh <SortIcon col="role" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900" onClick={() => toggleSort('team')}>
                    Phòng ban <SortIcon col="team" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Liên hệ</th>
                <th className="px-4 py-3 text-left">
                  <button className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900" onClick={() => toggleSort('office')}>
                    Văn phòng <SortIcon col="office" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Manager</th>
                <th className="px-4 py-3 text-left">
                  <button className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900" onClick={() => toggleSort('gender')}>
                    GT <SortIcon col="gender" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((m, i) => (
                <tr
                  key={m.id}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => setSelected(m)}
                >
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${avatarColor(getDept(m))}`}>
                        {getAvatar(m)}
                      </div>
                      <span className="font-medium text-gray-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[220px]">
                    <span className="line-clamp-2">{m.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${DEPT_COLORS[getDept(m)] ?? 'bg-gray-100 text-gray-700'}`}>
                      {m.team}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {m.phone && (
                        <a href={`tel:${m.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-xs">
                          <Phone className="w-3 h-3" /> {m.phone}
                        </a>
                      )}
                      <a href={`mailto:${m.email}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-xs">
                        <Mail className="w-3 h-3" /> {m.email}
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{m.office ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{m.manager || '—'}</td>
                  <td className="px-4 py-3 text-xs">
                    {m.gender === 'Nữ' ? (
                      <span className="text-pink-600">Nữ</span>
                    ) : m.gender === 'Nam' ? (
                      <span className="text-blue-600">Nam</span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 space-y-8">
            {DEPARTMENTS.filter(d => d !== 'Tất cả').map(d => {
              const members = filtered.filter(m => getDept(m) === d)
              if (!members.length) return null
              return (
                <section key={d}>
                  <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${DEPT_COLORS[d] ?? 'bg-gray-100 text-gray-700'}`}>
                      {d}
                    </span>
                    <span className="text-gray-400">{members.length} người</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {members.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setSelected(m)}
                        className="text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-sm transition-all"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold mb-3 ${avatarColor(getDept(m))}`}>
                          {getAvatar(m)}
                        </div>
                        <p className="font-medium text-gray-900 text-sm leading-tight">{m.name}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.role}</p>
                        {m.phone && (
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <Phone className="w-3 h-3" />{m.phone}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-5">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 ${avatarColor(getDept(selected))}`}>
                {getAvatar(selected)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selected.name}</h2>
                <p className="text-sm text-gray-600 mt-0.5">{selected.role}</p>
                <span className={`inline-flex mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${DEPT_COLORS[getDept(selected)] ?? 'bg-gray-100 text-gray-700'}`}>
                  {getDept(selected)}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-sm">
              {[
                { label: 'Email', value: selected.email, href: `mailto:${selected.email}` },
                { label: 'Điện thoại', value: selected.phone, href: selected.phone ? `tel:${selected.phone}` : undefined },
                { label: 'Văn phòng', value: selected.office },
                { label: 'Manager', value: selected.manager },
                { label: 'Giới tính', value: selected.gender },
                { label: 'Ngày sinh', value: selected.dob },
                { label: 'Ngày vào', value: selected.joinDate },
                { label: 'LC ID', value: selected.insideLC },
              ].map(({ label, value, href }) => value ? (
                <div key={label} className="flex gap-3">
                  <span className="w-24 text-gray-400 flex-shrink-0">{label}</span>
                  {href ? (
                    <a href={href} className="text-blue-600 hover:underline">{value}</a>
                  ) : (
                    <span className="text-gray-900">{value}</span>
                  )}
                </div>
              ) : null)}
            </div>

            {selected.responsibilities && selected.responsibilities.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Responsibilities</p>
                <ul className="space-y-1.5">
                  {selected.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setSelected(null)}
              className="mt-6 w-full py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
