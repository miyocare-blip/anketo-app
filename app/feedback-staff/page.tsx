'use client'

import { useState } from 'react'

export default function FeedbackStaffPage() {
  const [childName, setChildName] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!childName.trim()) {
      setError('お子さんのお名前を入力してください')
      return
    }
    if (!content.trim()) {
      setError('感想を入力してください')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_name: childName.trim().replace(/[\s　]+/g, ''),
          content: content.trim(),
          respondent_type: 'staff',
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '送信に失敗しました')
      }
      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '送信中にエラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">送信完了しました</h2>
          <p className="text-gray-500 text-sm">ご感想ありがとうございました。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-orange-200 text-orange-900 px-4 py-5 sticky top-0 z-10 shadow-sm">
        <h1 className="text-lg font-bold text-center">スタッフ感想フォーム</h1>
      </div>
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お子さんのお名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={childName}
                onChange={e => setChildName(e.target.value)}
                placeholder="例：山田太郎"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                今月の感想 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="今月の変化や気づいたことなど、自由にお書きください"
                rows={6}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 resize-none"
              />
            </div>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-orange-200 hover:bg-orange-300 text-orange-900 rounded-2xl py-4 font-bold text-base shadow-sm active:scale-95 transition-all disabled:opacity-60"
        >
          {submitting ? '送信中...' : '送信する ✓'}
        </button>
      </div>
    </div>
  )
}
