# API設計書: お知らせ API

| 項目 | 内容 |
| --- | --- |
| 作成日 | 2026-05-13 |
| 更新日 | 2026-05-13 |
| ステータス | 完了 |
| ベースパス | `/api/announcements` |

---

## エンドポイント一覧

| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| GET | `/api/announcements` | お知らせ一覧取得 | 要認証 |
| GET | `/api/announcements/:id` | お知らせ詳細取得 | 要認証 |
| POST | `/api/announcements` | お知らせ作成 | 管理者のみ |
| PUT | `/api/announcements/:id` | お知らせ更新 | 管理者のみ |
| DELETE | `/api/announcements/:id` | お知らせ削除 | 管理者のみ |

---

## エンドポイント詳細

### GET `/api/announcements` — 一覧取得

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `limit` | number | 任意 | 取得件数上限（省略時: 全件） |

**レスポンス（200 OK）**

```json
[
  {
    "id": "uuid",
    "title": "システムメンテナンスのお知らせ",
    "body": "5月20日 2:00〜4:00 にメンテナンスを行います。",
    "date": "2026-05-15",
    "category": "maintenance",
    "createdAt": "2026-05-13T00:00:00.000Z",
    "updatedAt": "2026-05-13T00:00:00.000Z"
  }
]
```

---

### GET `/api/announcements/:id` — 詳細取得

**レスポンス（200 OK）**

一覧の各要素と同じ形式のオブジェクトを返す。

---

### POST `/api/announcements` — 作成

**リクエストボディ**

```json
{
  "title": "システムメンテナンスのお知らせ",
  "body": "5月20日 2:00〜4:00 にメンテナンスを行います。",
  "date": "2026-05-15",
  "category": "maintenance"
}
```

| フィールド | 型 | 必須 | バリデーション |
| --- | --- | --- | --- |
| `title` | string | 必須 | 1文字以上 |
| `body` | string | 必須 | 1文字以上 |
| `date` | string | 必須 | `YYYY-MM-DD` 形式 |
| `category` | string | 必須 | `important` / `info` / `maintenance` |

**レスポンス（201 Created）**

作成したお知らせオブジェクトを返す。

---

### PUT `/api/announcements/:id` — 更新

**リクエストボディ**（POST と同じフィールド）

**レスポンス（200 OK）**

更新後のお知らせオブジェクトを返す。

---

### DELETE `/api/announcements/:id` — 削除

**レスポンス（204 No Content）**

---

## エラーレスポンス共通仕様

| ステータス | 説明 |
| --- | --- |
| 400 | バリデーションエラー |
| 401 | 未認証 |
| 403 | 管理者権限がない |
| 404 | お知らせが存在しない |
| 500 | サーバーエラー |

---

## 関連ドキュメント

- 機能設計書: `docs/features/announcements/announcements.md`
- DB設計書: `docs/database/announcements/announcements.md`
