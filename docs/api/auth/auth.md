# API設計書: 認証 API

| 項目 | 内容 |
| --- | --- |
| 作成日 | 2026-05-13 |
| 更新日 | 2026-05-13 |
| ステータス | 完了 |
| ベースパス | `/api/auth` |

---

## エンドポイント一覧

| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | ログイン・JWTトークン取得 | 不要 |
| POST | `/api/auth/change-password` | パスワード変更 | 要認証 |
| POST | `/api/auth/reset-password/request` | パスワードリセットメール送信 | 不要 |
| POST | `/api/auth/reset-password/confirm` | リセットトークンで新パスワード確定 | 不要 |

---

## エンドポイント詳細

### POST `/api/auth/login` — ログイン

**リクエストボディ**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

| フィールド | 型 | 必須 | バリデーション |
| --- | --- | --- | --- |
| `email` | string | 必須 | メール形式 |
| `password` | string | 必須 | 1文字以上 |

**レスポンス（200 OK）**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "山田太郎",
    "email": "user@example.com",
    "role": "member"
  }
}
```

**エラー**
- 401: メール・パスワード不一致、または `inactive` ユーザー

---

### POST `/api/auth/change-password` — パスワード変更

**リクエストボディ**

```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

| フィールド | 型 | 必須 | バリデーション |
| --- | --- | --- | --- |
| `currentPassword` | string | 必須 | 1文字以上 |
| `newPassword` | string | 必須 | 8文字以上 |

**レスポンス（200 OK）**

```json
{ "message": "パスワードを変更しました" }
```

**エラー**
- 401: 現在のパスワードが不一致

---

### POST `/api/auth/reset-password/request` — リセットメール送信

**リクエストボディ**

```json
{ "email": "user@example.com" }
```

**レスポンス（200 OK）**

```json
{ "message": "リセットメールを送信しました" }
```

> メールアドレスが存在しない場合も200を返す（ユーザー列挙攻撃対策）

---

### POST `/api/auth/reset-password/confirm` — 新パスワード確定

**リクエストボディ**

```json
{
  "token": "reset-token-string",
  "password": "newpass456"
}
```

| フィールド | 型 | 必須 | バリデーション |
| --- | --- | --- | --- |
| `token` | string | 必須 | 1文字以上 |
| `password` | string | 必須 | 8文字以上 |

**レスポンス（200 OK）**

```json
{ "message": "パスワードをリセットしました" }
```

**エラー**
- 400: トークン無効または有効期限切れ（1時間）

---

## エラーレスポンス共通仕様

| ステータス | 説明 |
| --- | --- |
| 400 | バリデーションエラー・トークン期限切れ |
| 401 | 認証失敗（パスワード不一致・inactive） |
| 500 | サーバーエラー |

---

## 関連ドキュメント

- 機能設計書: `docs/features/auth/auth.md`
- DB設計書: `docs/database/users/users.md`
