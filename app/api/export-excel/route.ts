import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import ExcelJS from 'exceljs'
import { ALL_SCALE_ITEMS } from '@/lib/survey-items'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const childName = searchParams.get('child_name')

  let query = supabaseAdmin.from('responses').select('*')
  if (childName) query = query.eq('child_name', childName)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'データ取得失敗' }, { status: 500 })

  const sorted = (data ?? []).sort((a, b) => {
    const aMonth = a.month === 'pre' ? '0000-00' : a.month
    const bMonth = b.month === 'pre' ? '0000-00' : b.month
    if (aMonth !== bMonth) return aMonth.localeCompare(bMonth)
    return (a.respondent_type === 'staff' ? 1 : 0) - (b.respondent_type === 'staff' ? 1 : 0)
  })

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('回答データ')

  const headers = [
    '回答月', '回答者', 'お名前', '年齢', '学年', '診断名', '現在の支援・療育',
    '好きな遊び', '好きな教科', '得意なこと', '集中しやすいこと', '人から褒められること',
    ...ALL_SCALE_ITEMS.map(i => i.label),
    'その他の困りごと', '一年後への希望', '送信日時',
  ]

  const headerRow = ws.addRow(headers)
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } }
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
    cell.alignment = { horizontal: 'center' }
  })

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
    const bgColor = isStaff ? 'FFE0F2FE' : 'FFFFFFFF'
    row.eachCell({ includeEmpty: true }, cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
    })
  })

  ws.columns.forEach(col => { col.width = 12 })
  ws.pageSetup.orientation = 'landscape'
  ws.pageSetup.fitToPage = true
  ws.pageSetup.fitToWidth = 1
  ws.pageSetup.fitToHeight = 0

  const buffer = await wb.xlsx.writeBuffer()
  const filename = childName
    ? `アンケート_${childName}_${new Date().toISOString().slice(0, 10)}.xlsx`
    : `アンケート_全員_${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(buffer as Buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  })
}
