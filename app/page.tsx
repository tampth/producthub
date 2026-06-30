'use client'

import Link from 'next/link'
import {
  Newspaper, Lightbulb, Bug, CalendarDays, MessageSquare, Users,
  Package, Eye, Map, BarChart3, Target, Rss, List, ClipboardList,
  FileText, BookOpen, ArrowRight, AlertCircle, Layers, Inbox,
  type LucideIcon,
} from 'lucide-react'
import { useObsidian } from '@/lib/hooks/useObsidian'
import { Idea, Bug as BugType, FeedbackItem, BacklogItem } from '@/lib/types'

/* ── Section helpers ──────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">{children}</p>
  )
}

function Pillar({
  icon: Icon, title, color, bg, children,
}: {
  icon: LucideIcon; title: string; color: string; bg: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className={`${bg} px-5 py-4 border-b border-gray-100 flex items-center gap-3`}>
        <div className={`w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center`}>
          <Icon size={16} className={color} />
        </div>
        <span className={`text-sm font-semibold ${color}`}>{title}</span>
      </div>
      <div className="p-3 space-y-1">{children}</div>
    </div>
  )
}

function PillarLink({ href, icon: Icon, label, desc }: { href: string; icon: LucideIcon; label: string; desc: string }) {
  return (
    <Link href={href}
      className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 group transition-colors">
      <Icon size={15} className="text-gray-400 mt-0.5 flex-shrink-0 group-hover:text-gray-600" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors leading-tight">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
      </div>
      <ArrowRight size={13} className="ml-auto text-gray-300 group-hover:text-blue-400 flex-shrink-0 mt-1 transition-colors" />
    </Link>
  )
}

function ContributeCard({
  href, icon: Icon, label, sublabel, accent,
}: {
  href: string; icon: LucideIcon; label: string; sublabel: string; accent: string
}) {
  return (
    <Link href={href}
      className={`flex flex-col gap-2 p-4 rounded-xl border-2 border-transparent ${accent} hover:shadow-md transition-all group`}>
      <Icon size={18} className="opacity-80" />
      <div>
        <p className="text-sm font-semibold leading-tight">{label}</p>
        <p className="text-xs opacity-70 mt-0.5">{sublabel}</p>
      </div>
    </Link>
  )
}

function PulseStat({ href, icon: Icon, label, value, accent }: {
  href: string; icon: LucideIcon; label: string; value: number; accent: string
}) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon size={15} />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </Link>
  )
}

/* ── Page ─────────────────────────────────────────── */

export default function HomePage() {
  const { items: ideas } = useObsidian<Idea>('ideas')
  const { items: bugs } = useObsidian<BugType>('bugs')
  const { items: feedback } = useObsidian<FeedbackItem>('feedback')
  const { items: backlog } = useObsidian<BacklogItem>('backlog')

  const openBugs       = bugs.filter(b => b.status === 'open' || b.status === 'in-progress').length
  const pendingIdeas   = ideas.filter(i => i.status === 'submitted' || i.status === 'in-review').length
  const inProgress     = backlog.filter(b => b.status === 'in-progress').length
  const newFeedback    = feedback.filter(f => f.status === 'new').length

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── Hero ───────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white px-8 py-8">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-xs">PH</span>
              </div>
              <span className="text-sm font-medium text-blue-200">Long Châu eCommerce</span>
            </div>
            <h1 className="text-2xl font-bold leading-snug">
              ProductHUB
            </h1>
            <p className="text-blue-100 text-sm max-w-lg leading-relaxed">
              Your asynchronous, on-demand resource base for all things product &amp; technology.
              Find what you need, contribute what you know — without interrupting your team.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {['Simple', 'Accessible to all', 'On-demand', 'Reduces context switching'].map(v => (
                <span key={v} className="text-xs bg-white/15 text-white/90 px-2.5 py-1 rounded-full">{v}</span>
              ))}
            </div>
          </div>
          <div className="hidden lg:block text-right text-blue-200 text-xs leading-loose flex-shrink-0">
            <p className="font-medium text-white/80 mb-1">Who owns ProductHUB?</p>
            <p>Product Ops — setup & structure</p>
            <p>Product / BA — content</p>
            <p>Everyone — contributes</p>
          </div>
        </div>
      </div>

      {/* ── Live Pulse ─────────────────────────────── */}
      <div>
        <SectionLabel>Live Pulse</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <PulseStat href="/bugs"     icon={AlertCircle}  label="Open Bugs"       value={openBugs}     accent="bg-red-50 text-red-500" />
          <PulseStat href="/ideas"    icon={Lightbulb}    label="Pending Ideas"   value={pendingIdeas}  accent="bg-yellow-50 text-yellow-500" />
          <PulseStat href="/backlog"  icon={Layers}       label="In Progress"     value={inProgress}    accent="bg-blue-50 text-blue-500" />
          <PulseStat href="/feedback" icon={Inbox}        label="New Feedback"    value={newFeedback}   accent="bg-green-50 text-green-500" />
        </div>
      </div>

      {/* ── Contribute ─────────────────────────────── */}
      <div>
        <SectionLabel>Contribute — Tell us something</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ContributeCard
            href="/ideas?tab=idea"
            icon={Lightbulb}
            label="I have an Idea"
            sublabel="Product improvement"
            accent="bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
          />
          <ContributeCard
            href="/ideas?tab=request"
            icon={ClipboardList}
            label="I have a Request"
            sublabel="Operational need"
            accent="bg-orange-50 text-orange-800 hover:bg-orange-100 border-orange-200"
          />
          <ContributeCard
            href="/bugs"
            icon={Bug}
            label="Report a Bug"
            sublabel="Something's broken"
            accent="bg-red-50 text-red-800 hover:bg-red-100 border-red-200"
          />
          <ContributeCard
            href="/feedback"
            icon={MessageSquare}
            label="Give Feedback"
            sublabel="Tell us what you think"
            accent="bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-200"
          />
        </div>
      </div>

      {/* ── Three Pillars ──────────────────────────── */}
      <div>
        <SectionLabel>Resources & Tools</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Stay Informed */}
          <Pillar icon={Newspaper} title="Stay Informed" color="text-purple-700" bg="bg-purple-50">
            <PillarLink href="/news/updates"  icon={Package}   label="Product Updates"       desc="Latest releases & changelogs" />
            <PillarLink href="/news/snapshot" icon={Eye}       label="Product Snapshot"      desc="Monthly metrics & initiatives" />
            <PillarLink href="/news/roadmaps"   icon={Map}       label="Product Roadmaps"      desc="Verified initiatives on the roadmap" />
            <PillarLink href="/news/metrics"  icon={BarChart3} label="Product Metrics"       desc="Performance stats & analysis" />
            <PillarLink href="/news/vision"   icon={Target}    label="Vision & Strategy"     desc="Long-term product direction" />
            <PillarLink href="/news/blog"     icon={Rss}       label="Update Blog"           desc="Internal & external updates" />
          </Pillar>

          {/* People & Events */}
          <Pillar icon={Users} title="People & Events" color="text-teal-700" bg="bg-teal-50">
            <PillarLink href="/demos"    icon={CalendarDays} label="Demo Meetings"       desc="Sprint demos & recordings" />
            <PillarLink href="/team"     icon={Users}        label="Meet the Division"   desc="Who does what, contact info" />
            <PillarLink href="/glossary" icon={BookOpen}     label="Glossary"            desc="Product & operational terms" />
            <div className="px-3 pt-3 pb-1">
              <p className="text-[11px] text-gray-400 leading-relaxed">
                <span className="font-medium text-gray-500">Tip:</span> Use the Glossary to resolve ambiguity before escalating — reduces ad-hoc interruptions.
              </p>
            </div>
          </Pillar>

          {/* BA / PO Workspace */}
          <Pillar icon={FileText} title="BA / PO Workspace" color="text-indigo-700" bg="bg-indigo-50">
            <PillarLink href="/backlog"      icon={List}         label="Product Backlog"    desc="Sprint & product backlog" />
            <PillarLink href="/requirements" icon={ClipboardList} label="Requirements Hub" desc="BRDs, PRDs, acceptance criteria" />
            <PillarLink href="/decisions"    icon={FileText}     label="Decision Log"       desc="Architecture & trade-off records" />
            <div className="px-3 pt-3 pb-1">
              <p className="text-[11px] text-gray-400 leading-relaxed">
                <span className="font-medium text-gray-500">Owned by:</span> Product Ops manages structure. BA/PO manages content. Powered by Obsidian vault.
              </p>
            </div>
          </Pillar>

        </div>
      </div>

      {/* ── Principle footer ───────────────────────── */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 flex items-start gap-4">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-blue-600 text-base">💡</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Reuse information — don&apos;t recreate it.</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Before sending a Slack message or calling a meeting to get an answer, check ProductHUB first.
            If the answer isn&apos;t here, contribute it so the next person doesn&apos;t have to ask either.
          </p>
        </div>
      </div>

    </div>
  )
}
