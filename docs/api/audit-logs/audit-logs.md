# API設計書: 監査ログ API

| 項目 | 内容 |
| --- | --- |
| 作成日 | 2026-05-13 |
| 更新日 | 2026-05-13 |
| ステータス | 完了 |
| ベースパス | `/api/audit-logs` |

---

## エンドポイント一覧

| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| GET | `/api/audit-logs` | 監査ログ一覧取得 | 管理者のみ |

---

## エンドポイント詳細

### GET `/api/audit-logs` — 一覧取得

**クエリパラメータ**（全てオプション）

| パラメータ | 型 | 説明 |
| --- | --- | --- |
| `page` | number | ページ番号（デフォルト: 1、最小: 1） |
| `limit` | number | 件数（デフォルト: 30、最大: 100） |
| `action` | string | アクション名でフィルタ（例: `user.create`） |
| `userId` | string | 操作ユーザーIDでフィルタ |
| `from` | string | 開始日時（ISO 8601、例: `2026-01-01T00:00:00Z`） |
| `to` | string | 終了日時（ISO 8601） |

**レスポンス（200 OK）**

```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userEmail": "admin@example.com",
      "action": "user.create",
      "targetType": "user",
      "targetId": "uuid",
      "detail": { "name": "田中花子", "email": "tanaka@example.com" },
      "createdAt": "2026-05-13T10:00:00.000Z"
    }
  ],
  "total": 500,
  "page": 1,
  "limit": 30
}
```

---

## 記録されるアクション一覧

| アクション | 概要 | targetType |
| --- | --- | --- |
| `auth.login` | ログイン | - |
| `auth.change_password` | パスワード変更 | - |
| `user.create` | ユーザー作成 | `user` |
| `user.update` | ユーザー更新 | `user` |
| `batch.schedule_update` | バッチスケジュール更新 | `batch` |
| `batch.toggle_enabled` | バッチ有効/無効切り替え | `batch` |
| `batch.rerun` | バッチ再実行 | `batch` |
| `announcement.create` | お知らせ作成 | `announcement` |
| `announcement.update` | お知らせ更新 | `announcement` |
| `announcement.delete` | お知らせ削除 | `announcement` |

---

## エラーレスポンス共通仕様

| ステータス | 説明 |
| --- | --- |
| 401 | 未認証 |
| 403 | 管理者権限がない |
| 500 | サーバーエラー |

---

## 備考・決定事項

- ログの作成はAPIハンドラ内で自動的に行われる（UIからの作成・削除は不可）
- `detail` フィールドにはアクションに応じた追加情報がJSON形式で格納される

---

## 関連ドキュメント

- 機能設計書: `docs/features/audit-logs/audit-logs.md`
- DB設計書: `docs/database/audit-logs/audit-logs.md`
