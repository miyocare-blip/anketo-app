import * as XLSX from 'xlsx'
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

export function exportToExcel(responses: Response[], childName?: string | null) {
  const rows = responses.map(r => {
    const [year, month] = r.month.split('-')
    const row: Record<string, string | number | null> = {
      '回答月': `${year}年${parseInt(month)}月`,
      'お名前': r.child_name,
      '年齢': r.child_age,
      '学年': r.child_grade,
      '診断名': r.diagnosis,
      '現在の支援・療育': r.current_support,
      '好きな遊び': r.favorite_play,
      '好きな教科': r.favorite_subject,
      '得意なこと': r.strengths,
      '集中しやすいこと': r.focus_areas,
      '人から褒められること': r.praised_for,
    }

    ALL_SCALE_ITEMS.forEach(item => {
      row[item.label] = r[item.key] as number | null
    })

    row['その他の困りごと'] = r.concerns_other
    row['一年後への希望'] = r.future_hopes
    row['送信日時'] = r.submitted_at ? new Date(r.submitted_at).toLocaleString('ja-JP') : null

    return row
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '回答データ')

  const filename = childName
    ? `アンケート_${childName}_${new Date().toISOString().slice(0, 10)}.xlsx`
    : `アンケート_全員_${new Date().toISOString().slice(0, 10)}.xlsx`

  XLSX.writeFile(wb, filename)
}
