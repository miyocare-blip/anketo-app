'use client'

import { useState } from 'react'
import ScaleQuestion from '@/components/ScaleQuestion'
import { BEHAVIOR_ITEMS, BODY_ITEMS, SENSORY_ITEMS } from '@/lib/survey-items'

type ScaleValues = Record<string, number | null>

const initialScales = (): ScaleValues => {
  const vals: ScaleValues = {}
  ;[...BEHAVIOR_ITEMS, ...BODY_ITEMS, ...SENSORY_ITEMS].forEach(item => {
    vals[item.key] = null
  })
  return vals
}

export default function SurveyPage() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState('')
  const [childGrade, setChildGrade] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [currentSupport, setCurrentSupport] = useState('')

  const [favoritePlay, setFavoritePlay] = useState('')
  const [favoriteSubject, setFavoriteSubject] = useState('')
  const [strengths, setStrengths] = useState('')
  const [focusAreas, setFocusAreas] = useState('')
  const [praisedFor, setPraisedFor] = useState('')

  const [scales, setScales] = useState<ScaleValues>(initialScales())
  const [concernsOther, setConcernsOther] = useState('')

  const [futureHopes, setFutureHopes] = useState('')

  const handleScaleChange = (key: string, value: number) => {
    setScales(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!childName.trim()) {
      setError('お子さんのお名前を入力してください')
      return
    }
    setError('')
    setSubmitting(true)

    try {
      const now = new Date()
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      const payload = {
        month,
        child_name: childName.trim(),
        child_age: childAge ? parseInt(childAge) : null,
        child_grade: childGrade.trim() || null,
        diagnosis: diagnosis.trim() || null,
        current_support: currentSupport.trim() || null,
        favorite_play: favoritePlay.trim() || null,
        favorite_subject: favoriteSubject.trim() || null,
        strengths: strengths.trim() || null,
        focus_areas: focusAreas.trim() || null,
        praised_for: praisedFor.trim() || null,
        ...scales,
        concerns_other: concernsOther.trim() || null,
        future_hopes: futureHopes.trim() || null,
      }

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">送信完了しました</h2>
          <p className="text-gray-500 text-sm">ご回答ありがとうございました。<br />来月もよろしくお願いいたします。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="bg-emerald-300 text-white px-4 py-5 sticky top-0 z-10 shadow-sm">
        <h1 className="text-lg font-bold text-center">保護者アンケート</h1>
        <div className="flex justify-center gap-1 mt-2">
          {[1, 2, 3, 4].map(n => (
            <div
              key={n}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                n <= step ? 'bg-white w-8' : 'bg-emerald-200 w-4'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-emerald-100 text-xs mt-1">ステップ {step} / 4</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">

        {step === 1 && (
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
              <h2 className="text-base font-bold text-emerald-600 mb-4 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-600 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">1</span>
                お子さんについて
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    お子さんのお名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={childName}
                    onChange={e => setChildName(e.target.value)}
                    placeholder="例：山田 太郎"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">年齢</label>
                    <input
                      type="number"
                      value={childAge}
                      onChange={e => setChildAge(e.target.value)}
                      placeholder="例：8"
                      min="1"
                      max="20"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">学年</label>
                    <input
                      type="text"
                      value={childGrade}
                      onChange={e => setChildGrade(e.target.value)}
                      placeholder="例：小2"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">診断名（あれば）</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    placeholder="例：ASD、ADHD など"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">現在受けている支援・療育</label>
                  <textarea
                    value={currentSupport}
                    onChange={e => setCurrentSupport(e.target.value)}
                    placeholder="例：週2回の言語療法、放課後デイサービス など"
                    rows={3}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 resize-none"
                  />
                </div>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mb-3 px-1">{error}</p>}
            <button
              onClick={() => {
                if (!childName.trim()) { setError('お子さんのお名前を入力してください'); return }
                setError('')
                setStep(2)
              }}
              className="w-full bg-emerald-300 text-white rounded-2xl py-4 font-bold text-base shadow-sm hover:bg-emerald-400 active:scale-95 transition-all"
            >
              次へ進む →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
              <h2 className="text-base font-bold text-emerald-600 mb-1 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-600 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">2</span>
                お子さんの得意なこと
              </h2>
              <p className="text-xs text-gray-400 mb-4 ml-9">思いつくままに自由にお書きください</p>
              <div className="space-y-4">
                {[
                  { label: '好きな遊び', value: favoritePlay, setter: setFavoritePlay, placeholder: '例：レゴ、砂遊び、ゲーム' },
                  { label: '好きな教科', value: favoriteSubject, setter: setFavoriteSubject, placeholder: '例：算数、図工、体育' },
                  { label: '得意なこと', value: strengths, setter: setStrengths, placeholder: '例：数字を覚えること、絵を描くこと' },
                  { label: '集中しやすいこと', value: focusAreas, setter: setFocusAreas, placeholder: '例：パズル、本を読むこと' },
                  { label: '人から褒められること', value: praisedFor, setter: setPraisedFor, placeholder: '例：素直、絵が上手、記憶力がいい' },
                ].map(({ label, value, setter, placeholder }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <textarea
                      value={value}
                      onChange={e => setter(e.target.value)}
                      placeholder={placeholder}
                      rows={2}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-600 rounded-2xl py-4 font-bold text-base hover:bg-gray-50 active:scale-95 transition-all"
              >
                ← 戻る
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-[2] bg-emerald-300 text-white rounded-2xl py-4 font-bold text-base shadow-sm hover:bg-emerald-400 active:scale-95 transition-all"
              >
                次へ進む →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
              <h2 className="text-base font-bold text-emerald-600 mb-1 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-600 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">3</span>
                現在気になっていること
              </h2>
              <p className="text-xs text-gray-400 mb-4 ml-9">1（気にならない）〜 5（とても気になる）で教えてください</p>

              <div className="mb-5">
                <h3 className="text-xs font-bold text-gray-500 tracking-wide mb-2 pb-1 border-b border-gray-100">行動・学習面</h3>
                {BEHAVIOR_ITEMS.map(item => (
                  <ScaleQuestion
                    key={item.key}
                    label={item.label}
                    name={item.key}
                    value={scales[item.key]}
                    onChange={v => handleScaleChange(item.key, v)}
                  />
                ))}
              </div>

              <div className="mb-5">
                <h3 className="text-xs font-bold text-gray-500 tracking-wide mb-2 pb-1 border-b border-gray-100">身体面</h3>
                {BODY_ITEMS.map(item => (
                  <ScaleQuestion
                    key={item.key}
                    label={item.label}
                    name={item.key}
                    value={scales[item.key]}
                    onChange={v => handleScaleChange(item.key, v)}
                  />
                ))}
              </div>

              <div className="mb-5">
                <h3 className="text-xs font-bold text-gray-500 tracking-wide mb-2 pb-1 border-b border-gray-100">感覚面</h3>
                {SENSORY_ITEMS.map(item => (
                  <ScaleQuestion
                    key={item.key}
                    label={item.label}
                    name={item.key}
                    value={scales[item.key]}
                    onChange={v => handleScaleChange(item.key, v)}
                  />
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">その他・気になること（自由記述）</label>
                <textarea
                  value={concernsOther}
                  onChange={e => setConcernsOther(e.target.value)}
                  placeholder="その他に気になっていることがあればご記入ください"
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-gray-300 text-gray-600 rounded-2xl py-4 font-bold text-base hover:bg-gray-50 active:scale-95 transition-all"
              >
                ← 戻る
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-[2] bg-emerald-300 text-white rounded-2xl py-4 font-bold text-base shadow-sm hover:bg-emerald-400 active:scale-95 transition-all"
              >
                次へ進む →
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
              <h2 className="text-base font-bold text-emerald-600 mb-1 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-600 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">4</span>
                将来への希望
              </h2>
              <p className="text-xs text-gray-400 mb-4 ml-9">お子さんの成長について、思いを聞かせてください</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  一年後にどんな変化があったら嬉しいですか？
                </label>
                <textarea
                  value={futureHopes}
                  onChange={e => setFutureHopes(e.target.value)}
                  placeholder="例：自分の気持ちを言葉で伝えられるようになってほしい、友達と楽しく遊べるようになってほしい など"
                  rows={5}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 resize-none"
                />
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 border border-gray-300 text-gray-600 rounded-2xl py-4 font-bold text-base hover:bg-gray-50 active:scale-95 transition-all"
              >
                ← 戻る
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] bg-emerald-300 text-white rounded-2xl py-4 font-bold text-base shadow-sm hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? '送信中...' : '送信する ✓'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
