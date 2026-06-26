'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ALL_SCALE_ITEMS } from '@/lib/survey-items'

const ResponseChart = dynamic(() => import('@/components/ResponseChart'), { ssr: false })

interface Response {
  id: string
  month: string
  respondent_type?: string
  child_name: string
  child_age: number | null
  child_grade: string | null
  diagnosis: string | null
  current_support: string | null
  favorite_play: string | null
  favorite_subject: string | null
  strengths: string | null
  focus_areas: string | null
  praised_for: string | null
  concerns_other: string | null
  future_hopes: string | null
  submitted_at: string
  [key: string]: number | string | null | undefined
}

type ViewMode = 'list' | 'detail' | 'chart' | 'feedback'

interface Feedback {
  id: string
  child_name: string
  month: string
  content: string
  respondent_type: string
  submitted_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [responses, setResponses] = useState<Response[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [exporting, setExporting] = useState(false)

  const fetchResponses = useCallback(async () => {
    const res = await fetch('/api/responses')
    if (res.status === 401) {
      router.push('/admin')
      return
    }
    const data = await res.json()
    setResponses(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [router])

  const fetchFeedbacks = useCallback(async () => {
    const res = await fetch('/api/feedback')
    if (res.ok) {
      const data = await res.json()
      setFeedbacks(Array.isArray(data) ? data : [])
    }
  }, [])

  useEffect(() => {
    fetchResponses()
    fetchFeedbacks()
  }, [fetchResponses, fetchFeedbacks])

  const childNames = [...new Set(responses.map(r => r.child_name))].sort()

  function formatMonthLabel(month: string): string {
    if (month === 'pre') return '施術前'
    const [year, mm] = month.split('-')
    return `${year}年${parseInt(mm)}月`
  }

  function sortedResponses(list: Response[]): Response[] {
    return [...list].sort((a, b) => {
      const aKey = a.month === 'pre' ? '0000-00' : a.month
      const bKey = b.month === 'pre' ? '0000-00' : b.month
      return aKey.localeCompare(bKey)
    })
  }

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin')
  }

  const handleExportExcel = async () => {
    setExporting(true)
    const params = selectedChild ? `?child_name=${encodeURIComponent(selectedChild)}` : ''
    const res = await fetch(`/api/export-excel${params}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const filename = selectedChild
      ? `アンケート_${selectedChild}_${new Date().toISOString().slice(0, 10)}.xls`
      : `アンケート_全員_${new Date().toISOString().slice(0, 10)}.xls`
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const handleExportCsv = async () => {
    setExporting(true)
    const params = selectedChild ? `?child_name=${encodeURIComponent(selectedChild)}` : ''
    const res = await fetch(`/api/export-csv${params}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const filename = selectedChild
      ? `アンケート_${selectedChild}_${new Date().toISOString().slice(0, 10)}.csv`
      : `アンケート_全員_${new Date().toISOString().slice(0, 10)}.csv`
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const handleExportPdf = async () => {
    setExporting(true)
    const { exportToPdf } = await import('@/lib/export-pdf')
    exportToPdf(filteredResponses, selectedChild)
    setExporting(false)
  }

  const toggleItem = (key: string) => {
    setSelectedItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const filteredResponses = selectedChild
    ? responses.filter(r => r.child_name === selectedChild)
    : responses

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <div className="bg-indigo-600 text-white px-4 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-base font-bold">📋 アンケート管理画面</h1>
          <button
            onClick={handleLogout}
            className="text-indigo-200 text-sm hover:text-white transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* フィルター・操作バー */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48">
            <label className="block text-xs text-gray-500 mb-1">お子さんで絞り込み</label>
            <select
              value={selectedChild ?? ''}
              onChange={e => setSelectedChild(e.target.value || null)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
            >
              <option value="">全員</option>
              {childNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(['list', 'chart', 'feedback'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {mode === 'list' ? '📋 一覧' : mode === 'chart' ? '📈 グラフ' : '💬 感想'}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              disabled={exporting}
              className="px-3 py-2 rounded-xl text-sm font-medium border border-green-400 text-green-700 hover:bg-green-50 transition-all disabled:opacity-50"
            >
              📊 Excel
            </button>
            <button
              onClick={handleExportCsv}
              disabled={exporting}
              className="px-3 py-2 rounded-xl text-sm font-medium border border-teal-400 text-teal-700 hover:bg-teal-50 transition-all disabled:opacity-50"
            >
              📋 CSV
            </button>
            <button
              onClick={handleExportPdf}
              disabled={exporting}
              className="px-3 py-2 rounded-xl text-sm font-medium border border-red-400 text-red-700 hover:bg-red-50 transition-all disabled:opacity-50"
            >
              📄 PDF
            </button>
          </div>
        </div>

        {/* 感想タブ（アンケートデータに依存しない） */}
        {viewMode === 'feedback' && (
          <div>
            {(() => {
              const filteredFeedbacks = selectedChild
                ? feedbacks.filter(f => f.child_name === selectedChild)
                : feedbacks
              const groupedByChild: Record<string, Feedback[]> = {}
              filteredFeedbacks.forEach(f => {
                if (!groupedByChild[f.child_name]) groupedByChild[f.child_name] = []
                groupedByChild[f.child_name].push(f)
              })
              const childOrder = Object.keys(groupedByChild).sort()
              return childOrder.length === 0 ? (
                <div className="text-center py-16 text-gray-400">感想がまだありません</div>
              ) : (
                <div className="space-y-5">
                  {childOrder.map(name => (
                    <div key={name} className="bg-white rounded-2xl shadow-sm p-5">
                      <h3 className="font-bold text-gray-800 text-base mb-3">{name}</h3>
                      <div className="space-y-3">
                        {groupedByChild[name]
                          .sort((a, b) => a.month.localeCompare(b.month))
                          .map(f => {
                            const [year, mm] = f.month.split('-')
                            return (
                              <div key={f.id} className={`border-l-4 pl-4 py-1 ${f.respondent_type === 'staff' ? 'border-orange-300' : 'border-purple-300'}`}>
                                <p className={`text-xs font-medium mb-1 ${f.respondent_type === 'staff' ? 'text-orange-600' : 'text-purple-600'}`}>
                                  {year}年{parseInt(mm)}月　{f.respondent_type === 'staff' ? '施設' : '保護者'}
                                </p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{f.content}</p>
                                <p className="text-xs text-gray-300 mt-1">
                                  {new Date(f.submitted_at).toLocaleDateString('ja-JP')}
                                </p>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        )}

        {viewMode !== 'feedback' && loading ? (
          <div className="text-center py-16 text-gray-400">読み込み中...</div>
        ) : viewMode !== 'feedback' && filteredResponses.length === 0 ? (
          <div className="text-center py-16 text-gray-400">回答がまだありません</div>
        ) : viewMode !== 'feedback' ? (
          <>
            {/* 一覧・詳細・グラフ表示 */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {sortedResponses(filteredResponses).map(r => (
                  <div key={r.id} className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800 text-base">{r.child_name}</h3>
                        <p className="text-xs text-gray-400">
                          {formatMonthLabel(r.month)}
                          {' · '}<span className={r.respondent_type === 'staff' ? 'text-sky-500' : r.respondent_type === 'child' ? 'text-emerald-600' : 'text-pink-400'}>{r.respondent_type === 'staff' ? '施設' : r.respondent_type === 'child' ? '指紋' : '保護者'}</span>
                          {r.child_age ? ` · ${r.child_age}歳` : ''}
                          {r.child_grade ? ` · ${r.child_grade}` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedChild(r.child_name)
                          setViewMode('detail')
                        }}
                        className="text-xs text-indigo-500 hover:text-indigo-700"
                      >
                        詳細 →
                      </button>
                    </div>

                    {/* 5段階スコアのサマリー */}
                    <div className="grid grid-cols-3 gap-2">
                      {ALL_SCALE_ITEMS.slice(0, 6).map(item => {
                        const val = r[item.key] as number | null
                        const color = val
                          ? ['', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700',
                              'bg-yellow-100 text-yellow-700', 'bg-orange-100 text-orange-700',
                              'bg-red-100 text-red-700'][val]
                          : 'bg-gray-100 text-gray-400'
                        return (
                          <div key={item.key} className="flex items-center gap-1">
                            <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${color}`}>
                              {val ?? '-'}
                            </span>
                            <span className="text-xs text-gray-500 truncate">{item.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 詳細表示 */}
            {viewMode === 'detail' && selectedChild && (
              <div className="space-y-4">
                <button
                  onClick={() => setViewMode('list')}
                  className="text-sm text-indigo-500 hover:text-indigo-700 mb-2"
                >
                  ← 一覧に戻る
                </button>
                {sortedResponses(filteredResponses).map(r => (
                  <div key={r.id} className="bg-white rounded-2xl shadow-sm p-5">
                    <h3 className="font-bold text-gray-800 text-base mb-1">{r.child_name}</h3>
                    <p className="text-xs text-gray-400 mb-4">
                      {formatMonthLabel(r.month)}
                      {' · '}<span className={r.respondent_type === 'staff' ? 'text-sky-500' : r.respondent_type === 'child' ? 'text-emerald-600' : 'text-pink-400'}>{r.respondent_type === 'staff' ? '施設' : r.respondent_type === 'child' ? '指紋' : '保護者'}</span>
                    </p>

                    <div className="space-y-4 text-sm">
                      {(r.child_age || r.child_grade) && (
                        <div className="flex gap-4">
                          {r.child_age && <div><span className="font-medium text-gray-600">年齢：</span>{r.child_age}歳</div>}
                          {r.child_grade && <div><span className="font-medium text-gray-600">学年：</span>{r.child_grade}</div>}
                        </div>
                      )}
                      {r.diagnosis && (
                        <div><span className="font-medium text-gray-600">診断名：</span>{r.diagnosis}</div>
                      )}
                      {r.current_support && (
                        <div><span className="font-medium text-gray-600">現在の支援：</span>{r.current_support}</div>
                      )}

                      <div className="border-t pt-3">
                        <p className="font-medium text-gray-600 mb-2">得意なこと</p>
                        {[
                          ['好きな遊び', r.favorite_play],
                          ['好きな教科', r.favorite_subject],
                          ['得意なこと', r.strengths],
                          ['集中しやすいこと', r.focus_areas],
                          ['褒められること', r.praised_for],
                        ].map(([label, val]) => val ? (
                          <p key={label as string} className="text-gray-600 mb-1">
                            <span className="text-gray-400">{label}：</span>{val as string}
                          </p>
                        ) : null)}
                      </div>

                      <div className="border-t pt-3">
                        <p className="font-medium text-gray-600 mb-2">困りごと（1〜5段階）</p>
                        <div className="space-y-1">
                          {ALL_SCALE_ITEMS.map(item => {
                            const val = r[item.key] as number | null
                            if (!val) return null
                            const color = ['', 'text-blue-600', 'text-green-600', 'text-yellow-600', 'text-orange-600', 'text-red-600'][val]
                            return (
                              <div key={item.key} className="flex justify-between items-center">
                                <span className="text-gray-500">{item.label}</span>
                                <span className={`font-bold ${color}`}>{val}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {r.concerns_other && (
                        <div className="border-t pt-3">
                          <p className="font-medium text-gray-600 mb-1">その他の困りごと</p>
                          <p className="text-gray-600">{r.concerns_other}</p>
                        </div>
                      )}

                      {r.future_hopes && (
                        <div className="border-t pt-3">
                          <p className="font-medium text-gray-600 mb-1">一年後への希望</p>
                          <p className="text-gray-600">{r.future_hopes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* グラフ表示 */}
            {viewMode === 'chart' && (
              <div>
                {!selectedChild && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 text-sm text-amber-700">
                    グラフを表示するには、上の「お子さんで絞り込み」でお子さんを選んでください。
                  </div>
                )}
                {selectedChild && (
                  <>
                    <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">表示する項目を選んでください（複数選択可）</p>
                      <div className="grid grid-cols-2 gap-2">
                        {ALL_SCALE_ITEMS.map(item => (
                          <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.key)}
                              onChange={() => toggleItem(item.key)}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-600">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-5">
                      <h3 className="font-bold text-gray-800 mb-4">{selectedChild} さんの変化</h3>
                      <ResponseChart
                        responses={filteredResponses}
                        selectedItems={selectedItems}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
