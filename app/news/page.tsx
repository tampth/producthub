'use client'

import Link from 'next/link'
import { Package, Eye, Map, BarChart3, Target, Rss, ArrowRight } from 'lucide-react'

const SECTIONS = [
  {
    href: '/news/updates', icon: Package, emoji: '⭐',
    label: 'Product Updates & Releases', color: 'text-purple-600', bg: 'bg-purple-50',
    desc: 'The latest product release & update information from the Product Division',
  },
  {
    href: '/news/snapshot', icon: Eye, emoji: '⭐',
    label: 'Product Snapshot', color: 'text-blue-600', bg: 'bg-blue-50',
    desc: 'High level summary of key Product Division metrics, key initiatives and product updates for the current month',
  },
  {
    href: '/news/roadmaps', icon: Map, emoji: '',
    label: 'Product Roadmaps', color: 'text-green-600', bg: 'bg-green-50',
    desc: 'The high level aspirational plans for the platform and product teams',
  },
  {
    href: '/news/metrics', icon: BarChart3, emoji: '',
    label: 'Product Metrics', color: 'text-orange-600', bg: 'bg-orange-50',
    desc: 'The latest stats and analysis of the performance of the platform',
  },
  {
    href: '/news/vision', icon: Target, emoji: '',
    label: 'Product Vision & Strategy', color: 'text-red-600', bg: 'bg-red-50',
    desc: 'The vision & plans for the platform for the near and long-term future',
  },
  {
    href: '/news/blog', icon: Rss, emoji: '',
    label: 'Product Update Blog', color: 'text-teal-600', bg: 'bg-teal-50',
    desc: 'The Product Update Blog — for external and internal audiences',
  },
]

export default function NewsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-700">ProductHUB Latest News</h2>
        <p className="text-gray-500 mt-1">Stay up to date with all product releases, metrics, and strategic updates.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {SECTIONS.map(s => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className={`w-14 h-14 ${s.bg} rounded-xl flex items-center justify-center`}>
              <s.icon size={28} className={s.color} />
            </div>
            <div>
              <p className={`font-semibold text-sm group-hover:text-blue-700 transition-colors ${s.color}`}>
                {s.emoji && <span className="mr-1">{s.emoji}</span>}{s.label}
              </p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{s.desc}</p>
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${s.color} mt-auto`}>
              View <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
