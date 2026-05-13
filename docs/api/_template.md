# API設計書: [機能名] API

| 項目 | 内容 |
| --- | --- |
| 作成日 | YYYY-MM-DD |
| 更新日 | YYYY-MM-DD |
| 作成者 | |
| ステータス | 草案 / レビュー中 / 承認済み / 完了 |
| ベースパス | `/api/example` |

---

## 概要

このAPIが提供する機能の概要を記載する。

---

## エンドポイント一覧

| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| GET | `/api/example` | 一覧取得 | 要認証 |
| GET | `/api/example/:id` | 詳細取得 | 要認証 |
| POST | `/api/example` | 新規作成 | 管理者のみ |
| PUT | `/api/example/:id` | 更新 | 管理者のみ |
| DELETE | `/api/example/:id` | 削除 | 管理者のみ |

---

## エンドポイント詳細

### GET `/api/example` — 一覧取得

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `page` | number | 任意 | ページ番号（デフォルト: 1） |
| `limit` | number | 任意 | 1ページの件数（デフォルト: 20） |
| `keyword` | string | 任意 | キーワード検索 |

**レスポンス（200 OK）**

```json
{
  "data": [
    {
      "id": 1,
      "name": "サンプル",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

### GET `/api/example/:id` — 詳細取得

**パスパラメータ**

| パラメータ | 型 | 説明 |
| --- | --- | --- |
| `id` | number | リソースID |

**レスポンス（200 OK）**

```json
{
  "id": 1,
  "name": "サンプル",
  "description": "説明文",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

---

### POST `/api/example` — 新規作成

**リクエストボディ**

```json
{
  "name": "サンプル",
  "description": "説明文"
}
```

| フィールド | 型 | 必須 | バリデーション |
| --- | --- | --- | --- |
| `name` | string | 必須 | 1〜100文字 |
| `description` | string | 任意 | 最大500文字 |

**レスポンス（201 Created）**

```json
{
  "id": 1,
  "name": "サンプル",
  "description": "説明文",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

---

### PUT `/api/example/:id` — 更新

**リクエストボディ**（POSTと同じフィールド）

**レスポンス（200 OK）**（詳細取得と同じ形式）

---

### DELETE `/api/example/:id` — 削除

**レスポンス（200 OK）**

```json
{
  "message": "削除しました"
}
```

---

## エラーレスポンス共通仕様

| ステータス | 説明 | レスポンス例 |
| --- | --- | --- |
| 400 | バリデーションエラー | `{ "error": "name は必須です" }` |
| 401 | 未認証 | `{ "error": "Unauthorized" }` |
| 403 | 権限不足 | `{ "error": "Forbidden" }` |
| 404 | リソース未存在 | `{ "error": "Not Found" }` |
| 500 | サーバーエラー | `{ "error": "Internal Server Error" }` |

---

## 関連ドキュメント

- 機能設計書: `docs/features/xxxx.md`
- DB設計書: `docs/database/xxxx.md`

---

## 備考・決定事項

- 例）削除はソフトデリート（`deletedAt` に日時をセット）
