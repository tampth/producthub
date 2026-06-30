'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home, Newspaper, Lightbulb, Bug, CalendarDays, MessageSquare,
  Users, FileText, List, ClipboardList, BookOpen, ChevronDown,
  ChevronRight, Package, BarChart3, Map, Eye, Rss, Target, Settings, Rocket,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  {
    label: '',
    items: [
      { href: '/', icon: Home, label: 'Home' },
    ],
  },
  {
    label: 'Stay Informed',
    items: [
      { href: '/news', icon: Newspaper, label: 'Product News', children: [
        { href: '/news/updates', icon: Package, label: 'Product Updates' },
        { href: '/news/snapshot', icon: Eye, label: 'Product Snapshot' },
        { href: '/news/roadmaps', icon: Map, label: 'Product Roadmaps' },
        { href: '/news/metrics', icon: BarChart3, label: 'Product Metrics' },
        { href: '/news/vision', icon: Target, label: 'Vision & Strategy' },
        { href: '/news/blog', icon: Rss, label: 'Update Blog' },
      ]},
    ],
  },
  {
    label: 'Contribute',
    items: [
      { href: '/ideas', icon: Lightbulb, label: 'Ideas & Requests' },
      { href: '/bugs', icon: Bug, label: 'Bugs & Incidents' },
      { href: '/feedback', icon: MessageSquare, label: 'Feedback' },
    ],
  },
  {
    label: 'People & Events',
    items: [
      { href: '/demos', icon: CalendarDays, label: 'Demo Meetings' },
      { href: '/team', icon: Users, label: 'Meet the Division' },
      { href: '/glossary', icon: BookOpen, label: 'Glossary' },
    ],
  },
  {
    label: 'BA/PO Workspace',
    items: [
      { href: '/initiatives', icon: Rocket, label: 'Initiatives' },
      { href: '/backlog', icon: List, label: 'Product Backlog' },
      { href: '/requirements', icon: ClipboardList, label: 'Requirements Hub' },
      { href: '/decisions', icon: FileText, label: 'Decision Log' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/settings', icon: Settings, label: 'Settings & Obsidian' },
    ],
  },
]

interface NavItemProps {
  href: string
  icon: LucideIcon
  label: string
  children?: { href: string; icon: LucideIcon; label: string }[]
  pathname: string
  depth?: number
}

function NavItem({ href, icon: Icon, label, children, pathname, depth = 0 }: NavItemProps) {
  const isActive = pathname === href
  const isChildActive = children?.some(c => pathname === c.href) ?? false
  const [open, setOpen] = useState(isChildActive || isActive)

  if (children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
            isActive || isChildActive
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          <Icon size={15} />
          <span className="flex-1 text-left">{label}</span>
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        {open && (
          <div className="ml-3 mt-0.5 pl-3 border-l border-gray-200">
            {children.map(child => (
              <NavItem key={child.href} {...child} pathname={pathname} depth={1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
        depth > 0 ? 'py-1' : '',
        isActive
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <Icon size={depth > 0 ? 13 : 15} />
      <span>{label}</span>
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-gray-200 flex flex-col overflow-hidden z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-200">
        <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-xs">PH</span>
        </div>
        <div>
          <p className="font-bold text-sm text-gray-900">ProductHUB</p>
          <p className="text-xs text-gray-400">eCommerce Division</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAV.map(section => (
          <div key={section.label || 'home'}>
            {section.label && (
              <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavItem key={item.href} {...item} pathname={pathname} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Obsidian connected" />
        <p className="text-[11px] text-gray-400">Async · On-demand · Open</p>
      </div>
    </aside>
  )
}
