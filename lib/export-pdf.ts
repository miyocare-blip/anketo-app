import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ALL_SCALE_ITEMS } from './survey-items'

interface Response {
  month: string
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

export function exportToPdf(responses: Response[], childName?: string | null) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const title = childName
    ? `アンケート回答 - ${childName}`
    : 'アンケート回答 - 全員'

  doc.setFontSize(14)
  doc.text(title, 14, 15)
  doc.setFontSize(9)
  doc.text(`出力日: ${new Date().toLocaleDateString('ja-JP')}`, 14, 22)

  const headers = [
    '回答月', 'お名前', '年齢', '学年',
    ...ALL_SCALE_ITEMS.map(i => i.label),
  ]

  const rows = responses.map(r => {
    const [year, month] = r.month.split('-')
    return [
      `${year}/${parseInt(month)}`,
      r.child_name,
      r.child_age?.toString() ?? '',
      r.child_grade ?? '',
      ...ALL_SCALE_ITEMS.map(item => r[item.key]?.toString() ?? '-'),
    ]
  })

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 27,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 255] },
  })

  const filename = childName
    ? `アンケート_${childName}_${new Date().toISOString().slice(0, 10)}.pdf`
    : `アンケート_全員_${new Date().toISOString().slice(0, 10)}.pdf`

  doc.save(filename)
}
