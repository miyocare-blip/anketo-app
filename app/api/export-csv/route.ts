import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { ALL_SCALE_ITEMS } from '@/lib/survey-items'

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
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

  const rows = sorted.map(r => {
    const monthLabel = r.month === 'pre' ? '施術前' : (() => {
      const [year, month] = r.month.split('-')
      return `${year}年${parseInt(month)}月`
    })()
    const respondent = r.respondent_type === 'staff' ? '施設スタッフ' : r.respondent_type === 'child' ? '指紋' : '保護者'
    const values: unknown[] = [
      monthLabel, respondent, r.child_name, r.child_age, r.child_grade,
      r.diagnosis, r.current_support, r.favorite_play, r.favorite_subject,
      r.strengths, r.focus_areas, r.praised_for,
      ...ALL_SCALE_ITEMS.map(item => r[item.key] ?? ''),
      r.concerns_other, r.future_hopes,
      r.submitted_at ? new Date(r.submitted_at).toLocaleString('ja-JP') : '',
    ]
    return values.map(csvCell).join(',')
  })

  const csv = [headers.map(csvCell).join(','), ...rows].join('\r\n')

  // UTF-8 BOM付き（ExcelとGoogleスプレッドシート両対応）
  const bom = '﻿'
  const filename = childName
    ? `アンケート_${childName}_${new Date().toISOString().slice(0, 10)}.csv`
    : `アンケート_全員_${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=UTF-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  })
}
