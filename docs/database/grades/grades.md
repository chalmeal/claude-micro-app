# DB設計書: grades テーブル

| 項目 | 内容 |
| --- | --- |
| 作成日 | 2026-05-13 |
| 更新日 | 2026-05-13 |
| ステータス | 完了 |
| テーブル名 | `grades` |

---

## 概要

学生の科目別成績を管理するテーブル。スコア（0〜100）と評価（S/A/B/C/D/F）をセットで保持する。同一学生・科目・年度・学期の組み合わせは一意。

---

## テーブル定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `id` | VARCHAR(36) | NOT NULL | — | 主キー（UUID） |
| `student_id` | VARCHAR(36) | NOT NULL | — | 学生ID |
| `student_name` | VARCHAR(255) | NOT NULL | — | 学生名 |
| `subject` | VARCHAR(255) | NOT NULL | — | 科目名 |
| `score` | INT | NOT NULL | — | スコア（0〜100） |
| `letter` | ENUM('S','A','B','C','D','F') | NOT NULL | — | 評価（スコアから自動計算） |
| `year` | INT | NOT NULL | — | 年度（2000以上） |
| `semester` | ENUM('spring','fall') | NOT NULL | — | 学期 |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新日時 |

---

## インデックス

| インデックス名 | カラム | 種類 | 目的 |
| --- | --- | --- | --- |
| PRIMARY | `id` | PRIMARY KEY | 主キー |
| `grades_unique` | `student_id, subject, year, semester` | UNIQUE | 重複登録防止 |

---

## リレーション

他テーブルとの外部キー制約はなし（`student_id` は `users.id` とは独立した文字列）。

---

## Drizzleスキーマ（参考）

```ts
export const grades = mysqlTable('grades', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  studentId: varchar('student_id', { length: 36 }).notNull(),
  studentName: varchar('student_name', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  score: int('score').notNull(),
  letter: mysqlEnum('letter', ['S', 'A', 'B', 'C', 'D', 'F']).notNull(),
  year: int('year').notNull(),
  semester: mysqlEnum('semester', ['spring', 'fall']).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})
```

---

## 備考・決定事項

- `letter` はアプリ側でスコアから計算してINSERT/UPDATEする。DBトリガーは使用しない
- 物理削除を行う（論理削除なし）

---

## 関連ドキュメント

- 機能設計書: `docs/features/grades/grades.md`
- API設計書: `docs/api/grades/grades.md`
