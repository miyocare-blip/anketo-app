import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendNotificationEmail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { child_name, month, ...rest } = body

    if (!child_name || !month) {
      return NextResponse.json({ error: 'お名前と回答月は必須です' }, { status: 400 })
    }

    // 同月同名の既存回答を確認
    const { data: existing } = await supabaseAdmin
      .from('responses')
      .select('id')
      .eq('child_name', child_name)
      .eq('month', month)
      .single()

    let result
    if (existing) {
      // 上書き更新
      result = await supabaseAdmin
        .from('responses')
        .update({ ...rest, submitted_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      // 新規登録
      result = await supabaseAdmin
        .from('responses')
        .insert({ child_name, month, ...rest })
    }

    if (result.error) {
      console.error('DB error:', result.error)
      return NextResponse.json({ error: 'データの保存に失敗しました' }, { status: 500 })
    }

    // メール通知（失敗してもレスポンスは成功扱い）
    try {
      await sendNotificationEmail(child_name, month)
    } catch (mailError) {
      console.error('Mail error:', mailError)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Submit error:', e)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
