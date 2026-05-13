# DB設計書: announcements テーブル

| 項目 | 内容 |
| --- | --- |
| 作成日 | 2026-05-13 |
| 更新日 | 2026-05-13 |
| ステータス | 完了 |
| テーブル名 | `announcements` |

---

## 概要

システム利用者へのお知らせを管理するテーブル。タイトル・本文・日付・カテゴリを保持する。

---

## テーブル定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `id` | VARCHAR(36) | NOT NULL | — | 主キー（UUID） |
| `title` | VARCHAR(255) | NOT NULL | — | タイトル |
| `body` | TEXT | NOT NULL | — | 本文 |
| `date` | DATE | NOT NULL | — | お知らせ日付（YYYY-MM-DD） |
| `category` | ENUM('important','info','maintenance') | NOT NULL | — | カテゴリ |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新日時 |

---

## インデックス

| インデックス名 | カラム | 種類 | 目的 |
| --- | --- | --- | --- |
| PRIMARY | `id` | PRIMARY KEY | 主キー |

---

## リレーション

他テーブルとの外部キー制約はなし。

---

## Drizzleスキーマ（参考）

```ts
export const announcements = mysqlTable('announcements', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  date: date('date').notNull(),
  category: mysqlEnum('category', ['important', 'info', 'maintenance']).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})
```

---

## 備考・決定事項

- 物理削除を行う（論理削除なし）

---

## 関連ドキュメント

- 機能設計書: `docs/features/announcements/announcements.md`
- API設計書: `docs/api/announcements/announcements.md`
