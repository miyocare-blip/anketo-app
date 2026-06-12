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
  respondent_type?: string
  [key: string]: number | string | null | undefined
}

interface Props {
  responses: Response[]
  selectedItems: string[]
}

const COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6',
]

function getMonthLabel(month: string): string {
  if (month === 'pre') return '施術前'
  const [yearStr, mmStr] = month.split('-')
  const year = parseInt(yearStr)
  const mm = parseInt(mmStr)
  const treatmentNum = (year - 2026) * 12 + (mm - 6) + 1
  return `${mm}月（${treatmentNum}回目）`
}

function sortKey(month: string): string {
  return month === 'pre' ? '0000-00' : month
}

export default function ResponseChart({ responses, selectedItems }: Props) {
  if (responses.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">データがありません</p>
  }

  const parentResponses = responses.filter(r => r.respondent_type === 'parent' || r.respondent_type == null)
  const staffResponses = responses.filter(r => r.respondent_type === 'staff')
  const childResponses = responses.filter(r => r.respondent_type === 'child')

  // 保護者・施設の両方の月を合わせてソート
  const allMonths = [...new Set(responses.map(r => r.month))].sort((a, b) =>
    sortKey(a).localeCompare(sortKey(b))
  )
  const labels = allMonths.map(getMonthLabel)

  const datasets = selectedItems.flatMap((key, i) => {
    const item = ALL_SCALE_ITEMS.find(it => it.key === key)
    const color = COLORS[i % COLORS.length]
    const base = {
      tension: 0.3,
      pointRadius: 5,
      pointHoverRadius: 7,
      spanGaps: true,
      backgroundColor: color + '20',
    }

    const result = []

    const parentData = allMonths.map(m => {
      const r = parentResponses.find(r => r.month === m)
      return r ? (r[key] as number | null) : null
    })
    if (parentData.some(v => v !== null)) {
      result.push({
        ...base,
        label: `${item?.label ?? key}（保護者）`,
        data: parentData,
        borderColor: color,
        borderDash: [],
      })
    }

    const staffData = allMonths.map(m => {
      const r = staffResponses.find(r => r.month === m)
      return r ? (r[key] as number | null) : null
    })
    if (staffData.some(v => v !== null)) {
      result.push({
        ...base,
        label: `${item?.label ?? key}（施設）`,
        data: staffData,
        borderColor: color,
        borderDash: [5, 5],
      })
    }

    const childData = allMonths.map(m => {
      const r = childResponses.find(r => r.month === m)
      return r ? (r[key] as number | null) : null
    })
    if (childData.some(v => v !== null)) {
      result.push({
        ...base,
        label: `${item?.label ?? key}（指紋）`,
        data: childData,
        borderColor: color,
        borderDash: [2, 2],
      })
    }

    return result
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
            const map: Record<number, string> = { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }
            return map[v as number] ?? v
          },
        },
      },
    },
  }

  return <Line data={data} options={options} />
}
