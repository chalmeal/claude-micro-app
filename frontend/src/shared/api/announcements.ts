import type { Announcement } from '@/shared/types'

let store: Announcement[] = [
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
  {
    id: '6',
    title: '新機能リリース: フィルター検索',
    body: 'ユーザー一覧にフィルター検索機能を追加しました。役割・ステータス・日付範囲での絞り込みが可能になりました。',
    date: '2026-03-20',
    category: 'info',
  },
]

const DELAY = 400

export async function getAnnouncements(): Promise<Announcement[]> {
  await new Promise((r) => setTimeout(r, DELAY))
  return [...store]
}

export async function getRecentAnnouncements(limit = 5): Promise<Announcement[]> {
  await new Promise((r) => setTimeout(r, DELAY))
  return store.slice(0, limit)
}

export async function getAnnouncementById(id: string): Promise<Announcement | undefined> {
  await new Promise((r) => setTimeout(r, DELAY))
  return store.find((a) => a.id === id)
}

export async function createAnnouncement(data: Omit<Announcement, 'id'>): Promise<Announcement> {
  await new Promise((r) => setTimeout(r, DELAY))
  const item: Announcement = { ...data, id: crypto.randomUUID() }
  store = [item, ...store]
  return item
}

export async function updateAnnouncement(
  id: string,
  data: Omit<Announcement, 'id'>,
): Promise<Announcement> {
  await new Promise((r) => setTimeout(r, DELAY))
  const updated: Announcement = { ...data, id }
  store = store.map((a) => (a.id === id ? updated : a))
  return updated
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300))
  store = store.filter((a) => a.id !== id)
}
