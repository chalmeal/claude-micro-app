# DB設計書: [テーブル名]

| 項目 | 内容 |
| --- | --- |
| 作成日 | YYYY-MM-DD |
| 更新日 | YYYY-MM-DD |
| 作成者 | |
| ステータス | 草案 / レビュー中 / 承認済み / 完了 |
| テーブル名 | `example` |

---

## 概要

このテーブルが管理するデータと目的を記載する。

---

## テーブル定義

### `example` テーブル

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `id` | INT UNSIGNED | NOT NULL | AUTO_INCREMENT | 主キー |
| `name` | VARCHAR(100) | NOT NULL | — | 名前 |
| `description` | TEXT | NULL | NULL | 説明 |
| `user_id` | INT UNSIGNED | NOT NULL | — | 作成ユーザーID（外部キー） |
| `deleted_at` | DATETIME | NULL | NULL | 論理削除日時 |
| `created_at` | DATETIME | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | DATETIME | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新日時 |

---

## インデックス

| インデックス名 | カラム | 種類 | 目的 |
| --- | --- | --- | --- |
| PRIMARY | `id` | PRIMARY KEY | 主キー |
| `idx_user_id` | `user_id` | INDEX | ユーザーID検索 |
| `idx_deleted_at` | `deleted_at` | INDEX | 論理削除フィルタ |

---

## 外部キー制約

| 制約名 | カラム | 参照テーブル | 参照カラム | ON DELETE |
| --- | --- | --- | --- | --- |
| `fk_example_user` | `user_id` | `users` | `id` | RESTRICT |

---

## リレーション

```
users (1) ──< example (N)
```

---

## Drizzleスキーマ（参考）

```ts
export const example = mysqlTable('example', {
  id: int('id').unsigned().autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  userId: int('user_id').unsigned().notNull(),
  deletedAt: datetime('deleted_at'),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
})
```

---

## データ例

| id | name | description | user_id | deleted_at | created_at |
| --- | --- | --- | --- | --- | --- |
| 1 | サンプルA | 説明文A | 1 | NULL | 2026-01-01 |
| 2 | サンプルB | NULL | 2 | NULL | 2026-01-02 |

---

## 関連ドキュメント

- 機能設計書: `docs/features/xxxx.md`
- API設計書: `docs/api/xxxx.md`

---

## 備考・決定事項

- 例）削除は論理削除（`deleted_at`）のみ。物理削除はしない
- 例）`updated_at` はDB側で自動更新するためアプリ側での更新は不要
