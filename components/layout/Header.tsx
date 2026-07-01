'use client'

import { usePathname } from 'next/navigation'
import { Bell, Search, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/news': 'Latest News',
  '/news/updates': 'Product Updates & Releases',
  '/news/snapshot': 'Product Snapshot',
  '/news/roadmaps': 'Product Roadmaps',
  '/news/metrics': 'Product Metrics',
  '/news/vision': 'Product Vision & Strategy',
  '/news/blog': 'Product Update Blog',
  '/initiatives': 'Initiatives & Roadmap',
  '/ideas': 'Ideas & Requests',
  '/bugs': 'Report a Bug',
  '/backlog': 'Backlog',
  '/requirements': 'Requirements Hub',
  '/decisions': 'Decision Log',
  '/demos': 'Product Demo Meetings',
  '/feedback': 'Feedback',
  '/glossary': 'Glossary',
  '/team': 'Meet the Division',
  '/settings': 'Settings & Obsidian',
  '/tasks': 'Tasks',
}

export function Header() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'ProductHUB'
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          {searchOpen ? (
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              onBlur={() => { setSearchOpen(false); setSearch('') }}
              placeholder="Search ProductHUB..."
              className="w-56 text-sm border border-gray-200 rounded-md px-3 py-1.5 pl-8 outline-none focus:border-blue-400"
            />
          ) : null}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Search size={16} />
          </button>
        </div>

        {/* Help */}
        <a
          href="https://drive.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          title="Google Drive"
        >
          <HelpCircle size={16} />
        </a>

        {/* Notifications */}
        <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors relative">
          <Bell size={16} />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User avatar */}
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
          PO
        </div>
      </div>
    </header>
  )
}
