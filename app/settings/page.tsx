'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, RefreshCw, FolderOpen, Database, Upload } from 'lucide-react'

const ENTITY_LABELS: Record<string, string> = {
  ideas: 'Ideas & Requests',
  bugs: 'Bugs',
  backlog: 'Backlog',
  requirements: 'Requirements',
  decisions: 'Decision Log',
  news: 'News Articles',
  team: 'Team Members',
  demos: 'Demo Meetings',
  feedback: 'Feedback',
  glossary: 'Glossary',
  initiatives: 'Initiatives',
}

const LS_KEYS: Record<string, string> = {
  ideas: 'producthub_ideas',
  bugs: 'producthub_bugs',
  backlog: 'producthub_backlog',
  requirements: 'producthub_requirements',
  decisions: 'producthub_decisions',
  news: 'producthub_news',
  team: 'producthub_team_v2',
  demos: 'producthub_demos',
  feedback: 'producthub_feedback',
  glossary: 'producthub_glossary',
}

interface VaultInfo {
  vaultPath: string
  hubFolder: string
  hubPath: string
  connected: boolean
  counts: Record<string, number>
}

export default function SettingsPage() {
  const [vault, setVault] = useState<VaultInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [migrating, setMigrating] = useState(false)
  const [migrateResult, setMigrateResult] = useState<Record<string, number> | null>(null)
  const [migrateError, setMigrateError] = useState('')

  async function loadStatus() {
    setLoading(true)
    try {
      const res = await fetch('/api/obsidian/status')
      setVault(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStatus() }, [])

  async function handleMigrate() {
    setMigrating(true)
    setMigrateResult(null)
    setMigrateError('')
    try {
      const data: Record<string, unknown[]> = {}
      for (const [entity, key] of Object.entries(LS_KEYS)) {
        const raw = localStorage.getItem(key)
        data[entity] = raw ? JSON.parse(raw) : []
      }
      const res = await fetch('/api/obsidian/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.ok) {
        setMigrateResult(json.results)
        await loadStatus()
      } else {
        setMigrateError(json.error ?? 'Unknown error')
      }
    } catch (e) {
      setMigrateError(String(e))
    } finally {
      setMigrating(false)
    }
  }

  const totalFiles = vault ? Object.values(vault.counts).reduce((a, b) => a + b, 0) : 0

  return (
    <div className="max-w-2xl mx-auto py-8 px-6 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý kết nối Obsidian và dữ liệu ProductHUB</p>
      </div>

      {/* Vault Connection */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-gray-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            Obsidian Vault
          </h2>
          <button
            onClick={loadStatus}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 rounded-md px-2.5 py-1.5"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-400">Đang kiểm tra kết nối...</div>
        ) : vault ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {vault.connected ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {vault.connected ? 'Đã kết nối' : 'Không tìm thấy vault'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">{vault.vaultPath}</p>
              </div>
            </div>

            {vault.connected && (
              <div className="flex items-start gap-2 pl-7">
                <FolderOpen className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">ProductHUB folder</p>
                  <p className="text-xs font-mono text-gray-700 mt-0.5">{vault.hubPath}</p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </section>

      {/* File counts per entity */}
      {vault?.connected && (
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-blue-600" />
            Dữ liệu trong Obsidian
            <span className="ml-auto text-sm font-normal text-gray-400">{totalFiles} files</span>
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(ENTITY_LABELS).map(([entity, label]) => {
              const count = vault.counts[entity] ?? 0
              return (
                <div key={entity} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{label}</span>
                  <span className={`text-sm font-medium ${count > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                    {count} {count === 1 ? 'file' : 'files'}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Migration */}
      {vault?.connected && (
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" />
            Migrate từ localStorage → Obsidian
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Chuyển toàn bộ dữ liệu hiện tại (lưu trong trình duyệt) sang Obsidian vault. Chạy một lần để khởi tạo.
          </p>

          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {migrating ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Đang migrate...</>
            ) : (
              <><Upload className="w-4 h-4" /> Migrate tất cả dữ liệu</>
            )}
          </button>

          {migrateResult && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">Migrate thành công!</p>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(migrateResult).map(([entity, count]) => (
                  <p key={entity} className="text-xs text-green-700">
                    {ENTITY_LABELS[entity] ?? entity}: <strong>{count}</strong> items
                  </p>
                ))}
              </div>
            </div>
          )}

          {migrateError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{migrateError}</p>
            </div>
          )}
        </section>
      )}

      {/* Env hint */}
      <section className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-medium text-gray-700 mb-2">Cấu hình (.env.local)</h2>
        <pre className="text-xs text-gray-600 font-mono bg-white border border-gray-200 rounded-lg p-3 overflow-x-auto">
{`OBSIDIAN_VAULT_PATH=C:\\Users\\User\\Documents\\tampt48
OBSIDIAN_PRODUCTHUB_FOLDER=ProductHUB`}
        </pre>
        <p className="text-xs text-gray-400 mt-2">Thay đổi vault path và restart server nếu muốn dùng vault khác.</p>
      </section>
    </div>
  )
}
