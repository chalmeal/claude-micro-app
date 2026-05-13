# DB設計書: users テーブル

| 項目 | 内容 |
| --- | --- |
| 作成日 | 2026-05-13 |
| 更新日 | 2026-05-13 |
| ステータス | 完了 |
| テーブル名 | `users` |

---

## 概要

システムにログインするユーザーアカウントを管理するテーブル。認証情報（パスワードハッシュ）・ロール・ステータス・パスワードリセット用トークンを保持する。

---

## テーブル定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `id` | VARCHAR(36) | NOT NULL | — | 主キー（UUID） |
| `name` | VARCHAR(255) | NOT NULL | — | ユーザー名 |
| `email` | VARCHAR(255) | NOT NULL | — | メールアドレス（一意） |
| `password_hash` | VARCHAR(255) | NOT NULL | — | bcryptハッシュ化パスワード |
| `role` | ENUM('admin','member') | NOT NULL | `member` | ロール |
| `status` | ENUM('active','inactive') | NOT NULL | `active` | ステータス |
| `password_reset_token` | VARCHAR(255) | NULL | NULL | パスワードリセットトークン |
| `password_reset_expires_at` | TIMESTAMP | NULL | NULL | リセットトークン有効期限 |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新日時 |

---

## インデックス

| インデックス名 | カラム | 種類 | 目的 |
| --- | --- | --- | --- |
| PRIMARY | `id` | PRIMARY KEY | 主キー |
| `users_email_unique` | `email` | UNIQUE | メールアドレスの一意性保証 |

---

## リレーション

```
users (1) ──< audit_logs (N)   ← userId で参照
```

---

## Drizzleスキーマ（参考）

```ts
export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['admin', 'member']).notNull().default('member'),
  status: mysqlEnum('status', ['active', 'inactive']).notNull().default('active'),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpiresAt: timestamp('password_reset_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})
```

---

## 備考・決定事項

- `password_reset_token` / `password_reset_expires_at` はパスワードリセットと初回パスワード設定の両方で共用
- 物理削除は行わない。退職者等は `status = inactive` に変更して対応
- `inactive` ユーザーはログイン不可

---

## 関連ドキュメント

- 機能設計書（認証）: `docs/features/auth/auth.md`
- 機能設計書（ユーザー管理）: `docs/features/users/users.md`
- API設計書（認証）: `docs/api/auth/auth.md`
- API設計書（ユーザー管理）: `docs/api/users/users.md`
