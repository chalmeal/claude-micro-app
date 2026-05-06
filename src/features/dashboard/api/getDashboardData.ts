import type { Announcement } from '@/shared/types'

export async function getDashboardAnnouncements(): Promise<Announcement[]> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  return [
    {
      id: '1',
      title: 'システムメンテナンスのお知らせ',
      body: '2026年5月10日（日）2:00〜5:00 にシステムメンテナンスを実施します。この時間帯はサービスをご利用いただけません。ご不便をおかけしますが、ご理解のほどよろしくお願いいたします。',
      date: '2026-05-01',
      category: 'important',
    },
    {
      id: '2',
      title: '新機能リリース: ユーザー一括登録',
      body: 'CSVファイルによるユーザー一括登録機能をリリースしました。ユーザー管理画面の「ユーザー追加」よりご利用いただけます。',
      date: '2026-04-28',
      category: 'info',
    },
    {
      id: '3',
      title: '利用規約の改定について',
      body: '2026年5月1日より利用規約が改定されます。変更内容については利用規約ページをご確認ください。引き続きサービスをご利用の場合は、改定後の利用規約に同意したものとみなします。',
      date: '2026-04-20',
      category: 'info',
    },
    {
      id: '4',
      title: '4月定期メンテナンス完了のお知らせ',
      body: '4月15日（月）に実施した定期メンテナンスが完了しました。引き続きご利用ください。',
      date: '2026-04-15',
      category: 'maintenance',
    },
    {
      id: '5',
      title: 'セキュリティアップデートのお知らせ',
      body: 'セキュリティ強化のため、パスワードポリシーを更新しました。次回ログイン時にパスワードの変更をお願いする場合があります。',
      date: '2026-04-05',
      category: 'important',
    },
  ]
}
