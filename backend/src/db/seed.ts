import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { announcements, grades, users } from './schema/index.js'

const SUBJECTS = [
  '数学I',
  '数学II',
  '英語',
  '国語',
  '物理',
  '化学',
  '生物',
  '歴史',
  '経済学',
  'プログラミング入門',
  'データ構造',
  'アルゴリズム論',
  '線形代数',
  '統計学',
  '情報倫理',
]

const YEARS = [2023, 2024] as const
const SEMESTERS = ['spring', 'fall'] as const

const USER_DATA: { name: string; email: string; role: 'admin' | 'member' }[] = [
  { name: '管理者', email: 'admin@example.com', role: 'admin' },
  { name: '山田 太郎', email: 'taro.yamada@example.com', role: 'member' },
  { name: '佐藤 花子', email: 'hanako.sato@example.com', role: 'member' },
  { name: '鈴木 次郎', email: 'jiro.suzuki@example.com', role: 'member' },
  { name: '高橋 美咲', email: 'misaki.takahashi@example.com', role: 'member' },
  { name: '伊藤 健', email: 'ken.ito@example.com', role: 'admin' },
  { name: '渡辺 由美', email: 'yumi.watanabe@example.com', role: 'member' },
  { name: '中村 大輔', email: 'daisuke.nakamura@example.com', role: 'member' },
  { name: '小林 さくら', email: 'sakura.kobayashi@example.com', role: 'member' },
  { name: '加藤 翔', email: 'sho.kato@example.com', role: 'member' },
  { name: '吉田 美穂', email: 'miho.yoshida@example.com', role: 'member' },
  { name: '山本 亮', email: 'ryo.yamamoto@example.com', role: 'member' },
  { name: '松本 結衣', email: 'yui.matsumoto@example.com', role: 'member' },
  { name: '井上 優', email: 'yu.inoue@example.com', role: 'member' },
  { name: '木村 智子', email: 'tomoko.kimura@example.com', role: 'admin' },
  { name: '林 健太', email: 'kenta.hayashi@example.com', role: 'member' },
  { name: '清水 奈々', email: 'nana.shimizu@example.com', role: 'member' },
  { name: '池田 浩', email: 'hiroshi.ikeda@example.com', role: 'member' },
  { name: '橋本 麻衣', email: 'mai.hashimoto@example.com', role: 'member' },
  { name: '石田 拓也', email: 'takuya.ishida@example.com', role: 'member' },
  { name: '前田 愛', email: 'ai.maeda@example.com', role: 'member' },
  { name: '藤田 一郎', email: 'ichiro.fujita@example.com', role: 'member' },
  { name: '藤井 明子', email: 'akiko.fujii@example.com', role: 'member' },
  { name: '岡田 雄介', email: 'yusuke.okada@example.com', role: 'member' },
  { name: '後藤 千尋', email: 'chihiro.goto@example.com', role: 'member' },
  { name: '長谷川 遥', email: 'haruka.hasegawa@example.com', role: 'member' },
  { name: '村上 陸', email: 'riku.murakami@example.com', role: 'member' },
  { name: '近藤 瞳', email: 'hitomi.kondo@example.com', role: 'member' },
  { name: '石川 海斗', email: 'kaito.ishikawa@example.com', role: 'member' },
  { name: '西村 彩', email: 'aya.nishimura@example.com', role: 'member' },
  { name: '福田 蓮', email: 'ren.fukuda@example.com', role: 'member' },
  { name: '三浦 凛', email: 'rin.miura@example.com', role: 'member' },
  { name: '岩崎 悠真', email: 'yuma.iwasaki@example.com', role: 'member' },
  { name: '坂本 莉子', email: 'riko.sakamoto@example.com', role: 'member' },
  { name: '中島 颯太', email: 'sota.nakajima@example.com', role: 'member' },
  { name: '原田 葵', email: 'aoi.harada@example.com', role: 'member' },
  { name: '小川 奏', email: 'kanade.ogawa@example.com', role: 'member' },
  { name: '田中 湊', email: 'minato.tanaka@example.com', role: 'member' },
  { name: '上田 咲', email: 'saki.ueda@example.com', role: 'member' },
  { name: '大野 蒼', email: 'ao.ohno@example.com', role: 'member' },
  { name: '工藤 羽', email: 'hane.kudo@example.com', role: 'member' },
  { name: '松田 悠', email: 'yu.matsuda@example.com', role: 'member' },
  { name: '桜井 凛太郎', email: 'rintaro.sakurai@example.com', role: 'member' },
  { name: '斎藤 結菜', email: 'yuna.saito@example.com', role: 'member' },
  { name: '堀 蓮司', email: 'renji.hori@example.com', role: 'member' },
  { name: '内田 朱音', email: 'akane.uchida@example.com', role: 'member' },
  { name: '谷口 朔', email: 'saku.taniguchi@example.com', role: 'member' },
  { name: '北村 汐里', email: 'shiori.kitamura@example.com', role: 'member' },
  { name: '宮崎 圭', email: 'kei.miyazaki@example.com', role: 'member' },
  { name: '秋山 凪', email: 'nagi.akiyama@example.com', role: 'member' },
]

const ANNOUNCEMENTS_DATA = [
  {
    title: 'システムメンテナンスのお知らせ',
    body: '2026年5月10日（日）2:00〜5:00 にシステムメンテナンスを実施します。この時間帯はサービスをご利用いただけません。ご不便をおかけしますが、ご理解のほどよろしくお願いいたします。',
    date: '2026-05-01',
    category: 'important' as const,
  },
  {
    title: '新機能リリース: ユーザー一括登録',
    body: 'CSVファイルによるユーザー一括登録機能をリリースしました。ユーザー管理画面の「ユーザー追加」よりご利用いただけます。',
    date: '2026-04-28',
    category: 'info' as const,
  },
  {
    title: '利用規約の改定について',
    body: '2026年5月1日より利用規約が改定されます。変更内容については利用規約ページをご確認ください。引き続きサービスをご利用の場合は、改定後の利用規約に同意したものとみなします。',
    date: '2026-04-20',
    category: 'info' as const,
  },
  {
    title: '4月定期メンテナンス完了のお知らせ',
    body: '4月15日（月）に実施した定期メンテナンスが完了しました。引き続きご利用ください。',
    date: '2026-04-15',
    category: 'maintenance' as const,
  },
  {
    title: 'セキュリティアップデートのお知らせ',
    body: 'セキュリティ強化のため、パスワードポリシーを更新しました。次回ログイン時にパスワードの変更をお願いする場合があります。',
    date: '2026-04-05',
    category: 'important' as const,
  },
  {
    title: '新機能リリース: フィルター検索',
    body: 'ユーザー一覧にフィルター検索機能を追加しました。役割・ステータス・日付範囲での絞り込みが可能になりました。',
    date: '2026-03-20',
    category: 'info' as const,
  },
  {
    title: '3月定期メンテナンスのお知らせ',
    body: '2026年3月15日（日）1:00〜4:00 にシステムメンテナンスを実施します。',
    date: '2026-03-10',
    category: 'maintenance' as const,
  },
  {
    title: '成績登録機能の改善について',
    body: '成績一括登録機能のCSVフォーマットを改善しました。複数行の入力が以前より簡単になりました。詳細はヘルプページをご確認ください。',
    date: '2026-03-01',
    category: 'info' as const,
  },
  {
    title: '2026年度 利用開始のお知らせ',
    body: '2026年度の成績管理システムの利用を開始しました。前年度の成績データは引き続き参照可能です。',
    date: '2026-02-20',
    category: 'important' as const,
  },
  {
    title: '2月定期メンテナンス完了のお知らせ',
    body: '2月10日（火）に実施した定期メンテナンスが完了しました。今回のメンテナンスではデータベースの最適化を実施しました。',
    date: '2026-02-10',
    category: 'maintenance' as const,
  },
  {
    title: 'パスワードリセット機能の追加',
    body: 'パスワードを忘れた場合のリセット機能を追加しました。ログイン画面の「パスワードを忘れた方」よりご利用ください。',
    date: '2026-01-25',
    category: 'info' as const,
  },
  {
    title: '年末年始のサービス停止について',
    body: '2025年12月29日（月）〜2026年1月3日（土）の期間、システムを停止します。ご不便をおかけして申し訳ありません。',
    date: '2025-12-20',
    category: 'important' as const,
  },
  {
    title: '12月定期メンテナンス完了のお知らせ',
    body: '12月15日（月）に実施した定期メンテナンスが完了しました。パフォーマンス改善のためのチューニングを実施しました。',
    date: '2025-12-15',
    category: 'maintenance' as const,
  },
  {
    title: 'CSVエクスポート機能のリリース',
    body: '成績データのCSVエクスポート機能をリリースしました。成績一覧画面の「エクスポート」ボタンよりご利用いただけます。',
    date: '2025-11-30',
    category: 'info' as const,
  },
  {
    title: '2025年度後期 成績登録期間のお知らせ',
    body: '2025年度後期の成績登録期間は11月1日〜11月30日です。期限内に登録をお済ませください。登録漏れがないよう、ご確認をお願いいたします。',
    date: '2025-11-01',
    category: 'important' as const,
  },
]

function deterministicScore(seed: number): number {
  return ((seed * 2654435761) >>> 0) % 61 + 40
}

function scoreToLetter(score: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'S'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST ?? 'db',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'app',
    password: process.env.DB_PASSWORD ?? 'app',
    database: process.env.DB_NAME ?? 'app',
  })
  const db = drizzle(conn)

  console.log('Seeding users...')
  const passwordHash = await bcrypt.hash('password123', 10)
  const createdUsers: { id: string; name: string }[] = []

  for (const u of USER_DATA) {
    const id = crypto.randomUUID()
    await db.insert(users).values({
      id,
      name: u.name,
      email: u.email,
      passwordHash,
      role: u.role,
      status: 'active',
    })
    createdUsers.push({ id, name: u.name })
  }
  console.log(`  ${createdUsers.length} users created`)

  console.log('Seeding announcements...')
  for (const a of ANNOUNCEMENTS_DATA) {
    await db.insert(announcements).values({
      id: crypto.randomUUID(),
      ...a,
    })
  }
  console.log(`  ${ANNOUNCEMENTS_DATA.length} announcements created`)

  console.log('Seeding grades...')
  let gradeCount = 0
  for (let ui = 0; ui < createdUsers.length; ui++) {
    const { id: studentId, name: studentName } = createdUsers[ui]
    for (let si = 0; si < SUBJECTS.length; si++) {
      for (let yi = 0; yi < YEARS.length; yi++) {
        for (let sei = 0; sei < SEMESTERS.length; sei++) {
          const seed = ui * 1000 + si * 100 + yi * 10 + sei
          const score = deterministicScore(seed)
          await db.insert(grades).values({
            id: crypto.randomUUID(),
            studentId,
            studentName,
            subject: SUBJECTS[si],
            score,
            letter: scoreToLetter(score),
            year: YEARS[yi],
            semester: SEMESTERS[sei],
          })
          gradeCount++
        }
      }
    }
  }
  console.log(`  ${gradeCount} grades created`)

  await conn.end()
  console.log('Seed complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
