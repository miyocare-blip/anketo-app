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

  const rows = responses.map(r => {
    const monthLabel = r.month === 'pre' ? '施術前' : (() => {
      const [year, month] = r.month.split('-')
      return `${year}年${parseInt(month)}月`
    })()
    const respondent = r.respondent_type === 'staff' ? '施設スタッフ' : '保護者'
    return { monthLabel, respondent, r }
  })

  const scaleHeaders = ALL_SCALE_ITEMS.map(i => `<th>${i.label}</th>`).join('')
  const scaleRows = rows.map(({ monthLabel, respondent, r }) => {
    const scaleCells = ALL_SCALE_ITEMS.map(item => {
      const val = r[item.key]
      return `<td style="text-align:center">${val ?? '-'}</td>`
    }).join('')
    return `
      <tr>
        <td>${monthLabel}</td>
        <td>${respondent}</td>
        <td>${r.child_name}</td>
        <td style="text-align:center">${r.child_age ?? ''}</td>
        <td>${r.child_grade ?? ''}</td>
        <td>${r.diagnosis ?? ''}</td>
        ${scaleCells}
        <td>${r.concerns_other ?? ''}</td>
        <td>${r.future_hopes ?? ''}</td>
      </tr>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: sans-serif; font-size: 9px; margin: 10mm; }
    h2 { font-size: 14px; margin-bottom: 4px; }
    p { font-size: 10px; color: #666; margin-bottom: 8px; }
    table { border-collapse: collapse; width: 100%; }
    th { background: #6366f1; color: white; padding: 4px 3px; border: 1px solid #ccc; white-space: nowrap; }
    td { padding: 3px; border: 1px solid #ddd; }
    tr:nth-child(even) { background: #f8f9ff; }
    button { margin-bottom: 12px; padding: 8px 20px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <h2>${title}</h2>
  <p>出力日: ${date}</p>
  <button onclick="window.print()">🖨️ 印刷 / PDFとして保存</button>
  <table>
    <thead>
      <tr>
        <th>回答月</th><th>回答者</th><th>お名前</th><th>年齢</th><th>学年</th><th>診断名</th>
        ${scaleHeaders}
        <th>その他</th><th>将来への希望</th>
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
