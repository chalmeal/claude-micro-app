# API設計書: ユーザー管理 API

| 項目 | 内容 |
| --- | --- |
| 作成日 | 2026-05-13 |
| 更新日 | 2026-05-13 |
| ステータス | 完了 |
| ベースパス | `/api/users` |

---

## エンドポイント一覧

| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| GET | `/api/users` | ユーザー一覧取得 | 管理者のみ |
| GET | `/api/users/:id` | ユーザー詳細取得 | 管理者のみ |
| POST | `/api/users` | ユーザー新規作成 | 管理者のみ |
| PATCH | `/api/users/:id` | ユーザー更新（role/status） | 管理者のみ |

---

## エンドポイント詳細

### GET `/api/users` — 一覧取得

**レスポンス（200 OK）**

```json
[
  {
    "id": "uuid",
    "name": "山田太郎",
    "email": "yamada@example.com",
    "role": "member",
    "status": "active",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### GET `/api/users/:id` — 詳細取得

**レスポンス（200 OK）**

```json
{
  "id": "uuid",
  "name": "山田太郎",
  "email": "yamada@example.com",
  "role": "member",
  "status": "active",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

---

### POST `/api/users` — 新規作成

**リクエストボディ**

```json
{
  "name": "山田太郎",
  "email": "yamada@example.com",
  "role": "member"
}
```

| フィールド | 型 | 必須 | バリデーション |
| --- | --- | --- | --- |
| `name` | string | 必須 | 1文字以上 |
| `email` | string | 必須 | メール形式 |
| `role` | string | 任意 | `admin` or `member`（デフォルト: `member`） |

> `status` フィールドはリクエストに含まれず、サーバー側でデフォルト値 `active` が設定される。

**レスポンス（201 Created）**

作成したユーザーオブジェクトを返す。同時に初期パスワード設定メールを送信（トークン有効期限: 7日）。

**エラー**
- 409: メールアドレスが既に使用中

---

### PATCH `/api/users/:id` — 更新

**リクエストボディ**

```json
{
  "role": "admin",
  "status": "inactive"
}
```

| フィールド | 型 | 必須 | バリデーション |
| --- | --- | --- | --- |
| `role` | string | 任意 | `admin` or `member` |
| `status` | string | 任意 | `active` or `inactive` |

**レスポンス（200 OK）**

更新後のユーザーオブジェクトを返す。

---

## エラーレスポンス共通仕様

| ステータス | 説明 |
| --- | --- |
| 400 | バリデーションエラー |
| 401 | 未認証 |
| 403 | 管理者権限がない |
| 404 | ユーザーが存在しない |
| 409 | メールアドレス重複 |
| 500 | サーバーエラー |

---

## 関連ドキュメント

- 機能設計書: `docs/features/users/users.md`
- DB設計書: `docs/database/users/users.md`
