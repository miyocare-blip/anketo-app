import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendNotificationEmail(childName: string, month: string) {
  const notifyEmails = process.env.NOTIFY_EMAILS?.split(',').map(e => e.trim()) ?? []
  if (notifyEmails.length === 0) return

  const [year, monthNum] = month.split('-')
  const monthLabel = `${year}年${parseInt(monthNum)}月`

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: notifyEmails.join(','),
    subject: `【アンケート回答】${childName}さんの${monthLabel}分が届きました`,
    text: `${childName}さんの保護者から${monthLabel}のアンケート回答が届きました。\n\n管理画面からご確認ください。`,
    html: `
      <p><strong>${childName}</strong>さんの保護者から<strong>${monthLabel}</strong>のアンケート回答が届きました。</p>
      <p>管理画面からご確認ください。</p>
    `,
  })
}
