'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { ALL_SCALE_ITEMS } from '@/lib/survey-items'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface Response {
  month: string
  [key: string]: number | string | null
}

interface Props {
  responses: Response[]
  selectedItems: string[]
}

const COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6',
]

// 6月2026 = 1回目、7月2026 = 2回目 として計算
function getMonthLabel(month: string): string {
  if (month === 'pre') return '施術前'
  const [yearStr, mmStr] = month.split('-')
  const year = parseInt(yearStr)
  const mm = parseInt(mmStr)
  const treatmentNum = (year - 2026) * 12 + (mm - 6) + 1
  return `${mm}月（${treatmentNum}回目）`
}

function sortResponses(responses: Response[]): Response[] {
  return [...responses].sort((a, b) => {
    const aKey = a.month === 'pre' ? '0000-00' : a.month
    const bKey = b.month === 'pre' ? '0000-00' : b.month
    return aKey.localeCompare(bKey)
  })
}

export default function ResponseChart({ responses, selectedItems }: Props) {
  if (responses.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">データがありません</p>
  }

  const sorted = sortResponses(responses)
  const labels = sorted.map(r => getMonthLabel(r.month))

  const datasets = selectedItems.map((key, i) => {
    const item = ALL_SCALE_ITEMS.find(it => it.key === key)
    return {
      label: item?.label ?? key,
      data: sorted.map(r => r[key] as number | null),
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length] + '20',
      tension: 0.3,
      pointRadius: 5,
      pointHoverRadius: 7,
      spanGaps: true,
    }
  })

  const data = { labels, datasets }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const, labels: { font: { size: 11 }, boxWidth: 12 } },
    },
    scales: {
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: (v: number | string) => {
            const labels: Record<number, string> = { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }
            return labels[v as number] ?? v
          },
        },
      },
    },
  }

  return <Line data={data} options={options} />
}
