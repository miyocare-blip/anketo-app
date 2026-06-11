import ExcelJS from 'exceljs'
import { ALL_SCALE_ITEMS } from './survey-items'

interface Response {
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

export async function exportToExcel(responses: Response[], childName?: string | null) {
  const sorted = [...responses].sort((a, b) => {
    const aMonth = a.month === 'pre' ? '0000-00' : a.month
    const bMonth = b.month === 'pre' ? '0000-00' : b.month
    if (aMonth !== bMonth) return aMonth.localeCompare(bMonth)
    const aType = a.respondent_type === 'staff' ? 1 : 0
    const bType = b.respondent_type === 'staff' ? 1 : 0
    return aType - bType
  })

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('回答データ')

  const headers = [
    '回答月', '回答者', 'お名前', '年齢', '学年', '診断名', '現在の支援・療育',
    '好きな遊び', '好きな教科', '得意なこと', '集中しやすいこと', '人から褒められること',
    ...ALL_SCALE_ITEMS.map(i => i.label),
    'その他の困りごと', '一年後への希望', '送信日時',
  ]

  // ヘッダー行
  const headerRow = ws.addRow(headers)
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } }
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
    cell.alignment = { horizontal: 'center' }
  })

  // データ行
  sorted.forEach(r => {
    const monthLabel = r.month === 'pre' ? '施術前' : (() => {
      const [year, month] = r.month.split('-')
      return `${year}年${parseInt(month)}月`
    })()
    const isStaff = r.respondent_type === 'staff'

    const rowData = [
      monthLabel,
      isStaff ? '施設スタッフ' : '保護者',
      r.child_name,
      r.child_age,
      r.child_grade,
      r.diagnosis,
      r.current_support,
      r.favorite_play,
      r.favorite_subject,
      r.strengths,
      r.focus_areas,
      r.praised_for,
      ...ALL_SCALE_ITEMS.map(item => r[item.key] ?? null),
      r.concerns_other,
      r.future_hopes,
      r.submitted_at ? new Date(r.submitted_at).toLocaleString('ja-JP') : null,
    ]

    const row = ws.addRow(rowData)

    // 施設スタッフは水色、保護者は白
    const bgColor = isStaff ? 'FFE0F2FE' : 'FFFFFFFF'
    row.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
    })
  })

  // 列幅
  ws.columns.forEach(col => { col.width = 12 })

  // 印刷設定：横1ページに収める・横向き
  ws.pageSetup.orientation = 'landscape'
  ws.pageSetup.fitToPage = true
  ws.pageSetup.fitToWidth = 1
  ws.pageSetup.fitToHeight = 0

  // ダウンロード
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = childName
    ? `アンケート_${childName}_${new Date().toISOString().slice(0, 10)}.xlsx`
    : `アンケート_全員_${new Date().toISOString().slice(0, 10)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
