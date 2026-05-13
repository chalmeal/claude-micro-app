# DB設計書: batches / batch_runs / batch_logs テーブル

| 項目 | 内容 |
| --- | --- |
| 作成日 | 2026-05-13 |
| 更新日 | 2026-05-13 |
| ステータス | 完了 |
| テーブル名 | `batches`, `batch_runs`, `batch_logs` |

---

## 概要

バッチジョブの定義・実行履歴・実行ログを管理する3つのテーブル。`batches` がジョブ定義、`batch_runs` が各実行の記録、`batch_logs` が実行中のログ行を保持する。

---

## テーブル定義

### `batches` テーブル

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `id` | VARCHAR(36) | NOT NULL | — | 主キー（UUID） |
| `name` | VARCHAR(255) | NOT NULL | — | バッチ名 |
| `description` | VARCHAR(500) | NOT NULL | `''` | 説明 |
| `status` | ENUM('success','failed','running','pending') | NOT NULL | `pending` | 最終実行ステータス |
| `schedule` | JSON | NOT NULL | — | スケジュール設定（JSON） |
| `last_run_at` | TIMESTAMP | NULL | NULL | 最終実行日時 |
| `last_duration` | INT | NULL | NULL | 最終実行時間（ms） |
| `next_run_at` | TIMESTAMP | NULL | NULL | 次回実行予定日時 |
| `enabled` | BOOLEAN | NOT NULL | `true` | 有効フラグ |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新日時 |

**`schedule` JSONの構造**

```json
{
  "frequency": "daily",
  "time": "00:00",
  "dayOfWeek": 1,
  "dayOfMonth": 1
}
```

---

### `batch_runs` テーブル

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `id` | VARCHAR(36) | NOT NULL | — | 主キー（UUID） |
| `batch_id` | VARCHAR(36) | NOT NULL | — | 外部キー → `batches.id` |
| `started_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 実行開始日時 |
| `finished_at` | TIMESTAMP | NULL | NULL | 実行完了日時 |
| `status` | ENUM('success','failed','running') | NOT NULL | `running` | 実行結果 |
| `duration` | INT | NULL | NULL | 実行時間（ms） |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |

---

### `batch_logs` テーブル

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `id` | VARCHAR(36) | NOT NULL | — | 主キー（UUID） |
| `batch_run_id` | VARCHAR(36) | NOT NULL | — | 外部キー → `batch_runs.id` |
| `timestamp` | VARCHAR(8) | NOT NULL | — | タイムスタンプ（`HH:MM:SS` 形式） |
| `level` | ENUM('info','warn','error') | NOT NULL | — | ログレベル |
| `message` | TEXT | NOT NULL | — | ログメッセージ |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |

---

## インデックス

| テーブル | インデックス名 | カラム | 種類 |
| --- | --- | --- | --- |
| `batches` | PRIMARY | `id` | PRIMARY KEY |
| `batch_runs` | PRIMARY | `id` | PRIMARY KEY |
| `batch_runs` | `idx_batch_runs_batch_started` | `batch_id, started_at` | INDEX |
| `batch_logs` | PRIMARY | `id` | PRIMARY KEY |
| `batch_logs` | `idx_batch_logs_run` | `batch_run_id` | INDEX |

---

## 外部キー制約

| テーブル | カラム | 参照テーブル | 参照カラム | ON DELETE |
| --- | --- | --- | --- | --- |
| `batch_runs` | `batch_id` | `batches` | `id` | CASCADE |
| `batch_logs` | `batch_run_id` | `batch_runs` | `id` | CASCADE |

---

## リレーション

```
batches (1) ──< batch_runs (N)
batch_runs (1) ──< batch_logs (N)
```

---

## 備考・決定事項

- `batches` の物理削除時は関連する `batch_runs` と `batch_logs` もCASCADE削除される
- スケジュールはJSONカラムで保持し、変更時にアプリ側で `next_run_at` を再計算する

---

## 関連ドキュメント

- 機能設計書: `docs/features/batches/batches.md`
- API設計書: `docs/api/batches/batches.md`
