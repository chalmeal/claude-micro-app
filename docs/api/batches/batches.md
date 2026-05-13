# API設計書: バッチジョブ管理 API

| 項目 | 内容 |
| --- | --- |
| 作成日 | 2026-05-13 |
| 更新日 | 2026-05-13 |
| ステータス | 完了 |
| ベースパス | `/api/batches` |

---

## エンドポイント一覧

| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| GET | `/api/batches` | バッチ一覧取得 | 管理者のみ |
| GET | `/api/batches/:id` | バッチ詳細取得 | 管理者のみ |
| GET | `/api/batches/:id/runs` | 実行履歴取得 | 管理者のみ |
| GET | `/api/batches/runs/:runId/logs` | 実行ログ取得 | 管理者のみ |
| PUT | `/api/batches/:id/schedule` | スケジュール更新 | 管理者のみ |
| PATCH | `/api/batches/:id/enabled` | 有効/無効切り替え | 管理者のみ |
| POST | `/api/batches/:id/rerun` | 即時再実行 | 管理者のみ |

---

## エンドポイント詳細

### GET `/api/batches` — 一覧取得

**レスポンス（200 OK）**

```json
[
  {
    "id": "uuid",
    "name": "日次集計バッチ",
    "description": "毎日0時に集計処理を実行する",
    "status": "success",
    "schedule": {
      "frequency": "daily",
      "time": "00:00"
    },
    "lastRunAt": "2026-05-13T00:00:00.000Z",
    "lastDuration": 1234,
    "nextRunAt": "2026-05-14T00:00:00.000Z",
    "enabled": true
  }
]
```

---

### GET `/api/batches/:id/runs` — 実行履歴取得

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `offset` | number | 任意 | オフセット（デフォルト: 0） |
| `limit` | number | 任意 | 件数（デフォルト: 30、最大: 100） |

**レスポンス（200 OK）**

```json
{
  "data": [
    {
      "id": "uuid",
      "batchId": "uuid",
      "startedAt": "2026-05-13T00:00:00.000Z",
      "finishedAt": "2026-05-13T00:00:01.234Z",
      "status": "success",
      "duration": 1234
    }
  ],
  "total": 50
}
```

---

### GET `/api/batches/runs/:runId/logs` — 実行ログ取得

**レスポンス（200 OK）**

```json
[
  {
    "id": "uuid",
    "batchRunId": "uuid",
    "timestamp": "00:00:00",
    "level": "info",
    "message": "処理開始"
  }
]
```

---

### PUT `/api/batches/:id/schedule` — スケジュール更新

**リクエストボディ**

```json
{
  "frequency": "weekly",
  "time": "09:00",
  "dayOfWeek": 1
}
```

| フィールド | 型 | 必須 | バリデーション |
| --- | --- | --- | --- |
| `frequency` | string | 必須 | `minutely`/`hourly`/`daily`/`weekly`/`monthly` |
| `time` | string | 必須 | `HH:MM` 形式 |
| `dayOfWeek` | number | `weekly`時のみ | 0〜6（0=日曜） |
| `dayOfMonth` | number | `monthly`時のみ | 1〜31 |

**レスポンス（200 OK）**

更新後のバッチオブジェクトを返す。`nextRunAt` は再計算された値。

---

### PATCH `/api/batches/:id/enabled` — 有効/無効切り替え

**リクエストボディ**

```json
{ "enabled": false }
```

**レスポンス（200 OK）**

更新後のバッチオブジェクトを返す。

---

### POST `/api/batches/:id/rerun` — 即時再実行

**レスポンス（200 OK）**

```json
{ "message": "再実行をトリガーしました" }
```

---

## エラーレスポンス共通仕様

| ステータス | 説明 |
| --- | --- |
| 400 | バリデーションエラー |
| 401 | 未認証 |
| 403 | 管理者権限がない |
| 404 | バッチ/実行が存在しない |
| 500 | サーバーエラー |

---

## 関連ドキュメント

- 機能設計書: `docs/features/batches/batches.md`
- DB設計書: `docs/database/batches/batches.md`
