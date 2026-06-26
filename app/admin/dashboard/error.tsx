'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">ページの読み込みに失敗しました</h2>
        <p className="text-gray-500 text-sm mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700"
        >
          もう一度試す
        </button>
      </div>
    </div>
  )
}
