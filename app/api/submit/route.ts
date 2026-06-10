import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendNotificationEmail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { child_name, month, respondent_type = 'parent', ...rest } = body

    if (!child_name || !month) {
      return NextResponse.json({ error: 'お名前と回答月は必須です' }, { status: 400 })
    }

    // スペース（全角・半角）を除去して名前を正規化
    const normalizedName = child_name.replace(/[\s　]+/g, '')

    // 同月・同名・同回答者種別の既存回答を確認
    const { data: existing } = await supabaseAdmin
      .from('responses')
      .select('id')
      .eq('child_name', normalizedName)
      .eq('month', month)
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
        .insert({ child_name: normalizedName, month, respondent_type, ...rest })
    }

    if (result.error) {
      console.error('DB error:', result.error)
      return NextResponse.json({ error: 'データの保存に失敗しました' }, { status: 500 })
    }

    try {
      await sendNotificationEmail(normalizedName, month)
    } catch (mailError) {
      console.error('Mail error:', mailError)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Submit error:', e)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
