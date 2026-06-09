'use client'

interface ScaleQuestionProps {
  label: string
  name: string
  value: number | null
  onChange: (value: number) => void
}

const SCALE_COLORS = [
  { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
  { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700' },
  { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700' },
  { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700' },
  { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700' },
]

export default function ScaleQuestion({ label, name, value, onChange }: ScaleQuestionProps) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <p className="text-sm text-gray-700 mb-2 leading-relaxed">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-14 shrink-0">気にならない</span>
        <div className="flex gap-2 flex-1 justify-center">
          {[1, 2, 3, 4, 5].map((n) => {
            const color = SCALE_COLORS[n - 1]
            const selected = value === n
            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={`w-11 h-11 rounded-full border-2 font-bold text-base transition-all duration-150 flex items-center justify-center shrink-0 ${
                  selected
                    ? `${color.bg} ${color.border} ${color.text} scale-110 shadow-md`
                    : 'border-gray-300 text-gray-400 bg-white hover:border-gray-400'
                }`}
              >
                {n}
              </button>
            )
          })}
        </div>
        <span className="text-xs text-gray-400 w-14 shrink-0 text-right">とても気になる</span>
      </div>
    </div>
  )
}
