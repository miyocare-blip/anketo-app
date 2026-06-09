import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const childName = searchParams.get('child_name')

  let query = supabaseAdmin
    .from('responses')
    .select('*')
    .order('month', { ascending: true })

  if (childName) {
    query = query.eq('child_name', childName)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 })
  }

  return NextResponse.json(data)
}
