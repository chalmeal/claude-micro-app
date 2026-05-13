# DB設計書: audit_logs テーブル

| 項目 | 内容 |
| --- | --- |
| 作成日 | 2026-05-13 |
| 更新日 | 2026-05-13 |
| ステータス | 完了 |
| テーブル名 | `audit_logs` |

---

## 概要

管理操作の証跡を記録するテーブル。誰が・いつ・何の操作をしたかを保持する。アプリケーションコードから自動的に書き込まれ、参照は管理者のみ行える。

---

## テーブル定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `id` | VARCHAR(36) | NOT NULL | — | 主キー（UUID） |
| `user_id` | VARCHAR(36) | NOT NULL | — | 操作者のユーザーID |
| `user_email` | VARCHAR(255) | NOT NULL | — | 操作者のメールアドレス（記録時点のスナップショット） |
| `action` | VARCHAR(100) | NOT NULL | — | アクション名（例: `user.create`） |
| `target_type` | VARCHAR(100) | NULL | NULL | 対象リソース種別（例: `user`, `batch`） |
| `target_id` | VARCHAR(255) | NULL | NULL | 対象リソースID |
| `detail` | JSON | NULL | NULL | 追加詳細情報 |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |

---

## インデックス

| インデックス名 | カラム | 種類 | 目的 |
| --- | --- | --- | --- |
| PRIMARY | `id` | PRIMARY KEY | 主キー |
| `idx_audit_logs_created_at` | `created_at` | INDEX | 日時範囲フィルタ |
| `idx_audit_logs_user_id` | `user_id` | INDEX | ユーザーIDフィルタ |
| `idx_audit_logs_action` | `action` | INDEX | アクションフィルタ |

---

## リレーション

`user_id` は `users.id` を参照するが、外部キー制約は設けていない（ユーザー削除後もログを保持するため）。`user_email` は記録時点の値をスナップショットとして持つ。

---

## Drizzleスキーマ（参考）

```ts
export const auditLogs = mysqlTable('audit_logs', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 36 }).notNull(),
  userEmail: varchar('user_email', { length: 255 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  targetType: varchar('target_type', { length: 100 }),
  targetId: varchar('target_id', { length: 255 }),
  detail: json('detail'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

---

## 備考・決定事項

- レコードの更新・削除は行わない（追記専用テーブル）
- `user_email` をスナップショットで持つのは、ユーザーのメール変更後もログを正確に読めるようにするため
- 外部キー制約を持たないのは、ユーザーが削除された後も監査証跡を保持するため

---

## 関連ドキュメント

- 機能設計書: `docs/features/audit-logs/audit-logs.md`
- API設計書: `docs/api/audit-logs/audit-logs.md`
