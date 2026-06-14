import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendNotificationEmail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { child_name, month, respondent_type = 'parent', ...rest } = body

    if (!child_name) {
      return NextResponse.json({ error: 'お名前は必須です' }, { status: 400 })
    }

    // スペース（全角・半角）を除去して名前を正規化
    const normalizedName = child_name.replace(/[\s　]+/g, '')

    // 月をサーバー側で自動判定
    // - child: 'pre'が存在すれば当月、なければ施術前
    // - parent/staff: 内容のある'pre'が存在すれば当月、なければ施術前（名前だけの空回答は上書き）
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    let monthToUse = month

    if (respondent_type === 'child') {
      const { data: preExisting } = await supabaseAdmin
        .from('responses')
        .select('id')
        .eq('child_name', normalizedName)
        .eq('month', 'pre')
        .eq('respondent_type', 'child')
        .maybeSingle()
      monthToUse = preExisting ? currentMonth : 'pre'
    } else if (month === 'auto') {
      const { data: meaningfulPre } = await supabaseAdmin
        .from('responses')
        .select('id')
        .eq('child_name', normalizedName)
        .eq('month', 'pre')
        .eq('respondent_type', respondent_type)
        .not('restlessness', 'is', null)
        .maybeSingle()
      monthToUse = meaningfulPre ? currentMonth : 'pre'
    }

    // 同月・同名・同回答者種別の既存回答を確認
    const { data: existing } = await supabaseAdmin
      .from('responses')
      .select('id')
      .eq('child_name', normalizedName)
      .eq('month', monthToUse)
      .eq('respondent_type', respondent_type)
      .single()

    let result
    if (existing) {
      result = await supabaseAdmin
        .from('responses')
        .update({ ...rest, respondent_type, submitted_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      result = await supabaseAdmin
        .from('responses')
        .insert({ child_name: normalizedName, month: monthToUse, respondent_type, ...rest })
    }

    if (result.error) {
      console.error('DB error:', result.error)
      return NextResponse.json({ error: `データの保存に失敗しました: ${result.error.message}` }, { status: 500 })
    }

    if (respondent_type === 'parent') {
      try {
        await sendNotificationEmail(normalizedName, monthToUse, respondent_type)
      } catch (mailError) {
        console.error('Mail error:', mailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Submit error:', e)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
