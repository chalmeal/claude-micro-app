import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'localhost',
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: false,
  ignoreTLS: true,
})

const FROM = process.env.SMTP_FROM ?? 'noreply@claude-micro-app.local'
const APP_URL = process.env.APP_URL ?? 'http://localhost:5173'

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'パスワード再設定のご案内',
    text: [
      'パスワード再設定のリクエストを受け付けました。',
      '',
      '下記のリンクから1時間以内にパスワードを再設定してください。',
      resetUrl,
      '',
      'このメールに心当たりがない場合は無視してください。',
    ].join('\n'),
    html: `
      <p>パスワード再設定のリクエストを受け付けました。</p>
      <p>下記のリンクから<strong>1時間以内</strong>にパスワードを再設定してください。</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>このメールに心当たりがない場合は無視してください。</p>
    `,
  })
}

export async function sendInitialSetupEmail(email: string, token: string): Promise<void> {
  const setupUrl = `${APP_URL}/setup-password?token=${token}`
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'アカウントのパスワード設定のご案内',
    text: [
      'アカウントが作成されました。',
      '',
      '下記のリンクから7日以内にパスワードを設定してアカウントを有効化してください。',
      setupUrl,
      '',
      'このメールに心当たりがない場合は無視してください。',
    ].join('\n'),
    html: `
      <p>アカウントが作成されました。</p>
      <p>下記のリンクから<strong>7日以内</strong>にパスワードを設定してアカウントを有効化してください。</p>
      <p><a href="${setupUrl}">${setupUrl}</a></p>
      <p>このメールに心当たりがない場合は無視してください。</p>
    `,
  })
}
