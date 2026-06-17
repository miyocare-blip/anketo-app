import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import nodemailer from 'nodemailer'
import { cookies } from 'next/headers'

async function sendFeedbackEmail(childName: string, month: string, content: string) {
  const notifyEmails = process.env.NOTIFY_EMAILS?.split(',').map(e => e.trim()) ?? []
  if (notifyEmails.length === 0) return

  const [year, monthNum] = month.split('-')
  const monthLabel = `${year}年${parseInt(monthNum)}月`

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: notifyEmails.join(','),
    subject: `【感想】${childName}さんの${monthLabel}分の感想が届きました`,
    text: `${childName}さんの${monthLabel}の感想が届きました。\n\n${content}\n\n管理画面からご確認ください。`,
    html: `
      <p><strong>${childName}</strong>さんの<strong>${monthLabel}</strong>の感想が届きました。</p>
      <blockquote style="border-left:3px solid #f59e0b;padding-left:12px;color:#555;">${content.replace(/\n/g, '<br>')}</blockquote>
      <p>管理画面からご確認ください。</p>
    `,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { child_name, content } = body

    if (!child_name?.trim()) {
      return NextResponse.json({ error: 'お名前は必須です' }, { status: 400 })
    }
    if (!content?.trim()) {
      return NextResponse.json({ error: '感想を入力してください' }, { status: 400 })
    }

    const normalizedName = child_name.trim().replace(/[\s　]+/g, '')
    const respondent_type = body.respondent_type === 'staff' ? 'staff' : 'parent'
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const { error } = await supabaseAdmin
      .from('feedback')
      .insert({ child_name: normalizedName, month, content: content.trim(), respondent_type })

    if (error) {
      console.error('DB error:', error)
      return NextResponse.json({ error: 'データの保存に失敗しました' }, { status: 500 })
    }

    try {
      await sendFeedbackEmail(normalizedName, month, content.trim())
    } catch (mailError) {
      console.error('Mail error:', mailError)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Feedback submit error:', e)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (session?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const childName = searchParams.get('child_name')

  let query = supabaseAdmin
    .from('feedback')
    .select('*')
    .order('month', { ascending: true })
    .order('submitted_at', { ascending: false })

  if (childName) {
    query = query.eq('child_name', childName)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
