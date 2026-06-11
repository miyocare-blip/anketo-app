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

export function exportToPdf(responses: Response[], childName?: string | null) {
  const title = childName ? `アンケート回答 - ${childName}` : 'アンケート回答 - 全員'
  const date = new Date().toLocaleDateString('ja-JP')

  const sorted = [...responses].sort((a, b) => {
    const aMonth = a.month === 'pre' ? '0000-00' : a.month
    const bMonth = b.month === 'pre' ? '0000-00' : b.month
    if (aMonth !== bMonth) return aMonth.localeCompare(bMonth)
    const aType = a.respondent_type === 'staff' ? 1 : 0
    const bType = b.respondent_type === 'staff' ? 1 : 0
    return aType - bType
  })
  const rows = sorted.map(r => {
    const monthLabel = r.month === 'pre' ? '施術前' : (() => {
      const [year, month] = r.month.split('-')
      return `${year}年${parseInt(month)}月`
    })()
    const respondent = r.respondent_type === 'staff' ? '施設スタッフ' : '保護者'
    return { monthLabel, respondent, r }
  })

  // 表1：基本情報
  const basicRows = rows.map(({ monthLabel, respondent, r }) => `
    <tr>
      <td>${monthLabel}</td>
      <td>${respondent}</td>
      <td>${r.child_name}</td>
      <td>${r.child_age ?? ''}</td>
      <td>${r.child_grade ?? ''}</td>
      <td>${r.diagnosis ?? ''}</td>
      <td>${r.current_support ?? ''}</td>
      <td>${r.concerns_other ?? ''}</td>
      <td>${r.future_hopes ?? ''}</td>
    </tr>`).join('')

  // 表2：5段階評価
  const scaleRows = rows.map(({ monthLabel, respondent, r }) => {
    const cells = ALL_SCALE_ITEMS.map(item => {
      const val = r[item.key]
      const color = val === 5 ? '#fee2e2' : val === 4 ? '#fef9c3' : ''
      return `<td style="text-align:center;background:${color}">${val ?? '-'}</td>`
    }).join('')
    return `<tr><td>${monthLabel}</td><td>${respondent}</td><td>${r.child_name}</td>${cells}</tr>`
  }).join('')

  const scaleHeaders = ALL_SCALE_ITEMS.map(i => `<th>${i.label}</th>`).join('')

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: sans-serif; font-size: 10px; margin: 10mm; }
    h2 { font-size: 14px; margin: 0 0 4px; }
    .meta { color: #666; margin-bottom: 10px; font-size: 10px; }
    h3 { font-size: 11px; margin: 16px 0 4px; color: #444; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 8px; }
    th { background: #6366f1; color: white; padding: 4px 3px; border: 1px solid #aaa; white-space: nowrap; font-size: 9px; }
    td { padding: 3px; border: 1px solid #ddd; font-size: 9px; }
    tr:nth-child(even) { background: #f8f9ff; }
    button { margin-bottom: 12px; padding: 8px 20px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
    @media print {
      button { display: none; }
      @page { size: A4 landscape; margin: 8mm; }
    }
  </style>
</head>
<body>
  <h2>${title}</h2>
  <div class="meta">出力日: ${date}</div>
  <button onclick="window.print()">🖨️ 印刷 / PDFとして保存</button>

  <h3>■ 基本情報・自由記述</h3>
  <table>
    <thead>
      <tr>
        <th>回答月</th><th>回答者</th><th>お名前</th><th>年齢</th><th>学年</th>
        <th>診断名</th><th>現在の支援・療育</th><th>その他の困りごと</th><th>将来への希望</th>
      </tr>
    </thead>
    <tbody>${basicRows}</tbody>
  </table>

  <h3>■ 5段階評価（4・5は色付き）</h3>
  <table>
    <thead>
      <tr>
        <th>回答月</th><th>回答者</th><th>お名前</th>
        ${scaleHeaders}
      </tr>
    </thead>
    <tbody>${scaleRows}</tbody>
  </table>
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}
