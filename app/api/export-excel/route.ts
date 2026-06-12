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

  const headerHtml = `<tr>${headers.map(h => `<td bgcolor="#6366F1"><font color="#FFFFFF"><b>${esc(h)}</b></font></td>`).join('')}</tr>`

  const dataHtml = sorted.map(r => {
    const monthLabel = r.month === 'pre' ? '施術前' : (() => {
      const [year, month] = r.month.split('-')
      return `${year}年${parseInt(month)}月`
    })()
    const isStaff = r.respondent_type === 'staff'
    const isChild = r.respondent_type === 'child'
    const bg = isStaff ? '#E0F2FE' : isChild ? '#DCFCE7' : '#FFFFFF'

    const values: unknown[] = [
      monthLabel,
      isStaff ? '施設スタッフ' : isChild ? '指紋' : '保護者',
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

    return `<tr>${values.map(v => `<td bgcolor="${bg}">${esc(v)}</td>`).join('')}</tr>`
  }).join('\n')

  const html = `<html>
<head><meta charset="UTF-8"></head>
<body>
<table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;font-size:11pt;font-family:sans-serif;">
  ${headerHtml}
  ${dataHtml}
</table>
</body>
</html>`

  const filename = childName
    ? `アンケート_${childName}_${new Date().toISOString().slice(0, 10)}.xls`
    : `アンケート_全員_${new Date().toISOString().slice(0, 10)}.xls`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'application/vnd.ms-excel; charset=UTF-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  })
}
