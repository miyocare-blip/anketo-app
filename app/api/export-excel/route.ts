import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { ALL_SCALE_ITEMS } from '@/lib/survey-items'

function esc(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function cell(value: unknown, styleId: string): string {
  const type = typeof value === 'number' ? 'Number' : 'String'
  return `<Cell ss:StyleID="${styleId}"><Data ss:Type="${type}">${esc(value)}</Data></Cell>`
}

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

  const headers = [
    '回答月', '回答者', 'お名前', '年齢', '学年', '診断名', '現在の支援・療育',
    '好きな遊び', '好きな教科', '得意なこと', '集中しやすいこと', '人から褒められること',
    ...ALL_SCALE_ITEMS.map(i => i.label),
    'その他の困りごと', '一年後への希望', '送信日時',
  ]

  const headerRow = `<Row>${headers.map(h => cell(h, 'header')).join('')}</Row>`

  const dataRows = sorted.map(r => {
    const monthLabel = r.month === 'pre' ? '施術前' : (() => {
      const [year, month] = r.month.split('-')
      return `${year}年${parseInt(month)}月`
    })()
    const isStaff = r.respondent_type === 'staff'
    const s = isStaff ? 'staff' : 'parent'

    const values: unknown[] = [
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
      ...ALL_SCALE_ITEMS.map(item => r[item.key] ?? ''),
      r.concerns_other,
      r.future_hopes,
      r.submitted_at ? new Date(r.submitted_at).toLocaleString('ja-JP') : '',
    ]

    return `<Row>${values.map(v => cell(v, s)).join('')}</Row>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office">
  <Styles>
    <Style ss:ID="header">
      <Interior ss:Color="#6366F1" ss:Pattern="Solid"/>
      <Font ss:Color="#FFFFFF" ss:Bold="1"/>
      <Alignment ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="parent">
      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="staff">
      <Interior ss:Color="#E0F2FE" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="回答データ">
    <Table>
      ${headerRow}
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`

  const filename = childName
    ? `アンケート_${childName}_${new Date().toISOString().slice(0, 10)}.xls`
    : `アンケート_全員_${new Date().toISOString().slice(0, 10)}.xls`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/vnd.ms-excel; charset=UTF-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  })
}
