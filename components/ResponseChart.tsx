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

export default function ResponseChart({ responses, selectedItems }: Props) {
  if (responses.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">データがありません</p>
  }

  const months = responses.map(r => {
    const [year, month] = r.month.split('-')
    return `${year}年${parseInt(month)}月`
  })

  const datasets = selectedItems.map((key, i) => {
    const item = ALL_SCALE_ITEMS.find(it => it.key === key)
    return {
      label: item?.label ?? key,
      data: responses.map(r => r[key] as number | null),
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length] + '20',
      tension: 0.3,
      pointRadius: 5,
      pointHoverRadius: 7,
    }
  })

  const data = { labels: months, datasets }

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
