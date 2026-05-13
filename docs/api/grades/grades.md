# API設計書: 成績管理 API

| 項目 | 内容 |
| --- | --- |
| 作成日 | 2026-05-13 |
| 更新日 | 2026-05-13 |
| ステータス | 完了 |
| ベースパス | `/api/grades` |

---

## エンドポイント一覧

| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| GET | `/api/grades` | 成績一覧取得 | 要認証 |
| GET | `/api/grades/:id` | 成績詳細取得 | 要認証 |
| POST | `/api/grades` | 成績登録 | 要認証 |
| PUT | `/api/grades/:id` | 成績更新 | 要認証 |
| DELETE | `/api/grades/:id` | 成績削除 | 要認証 |

---

## エンドポイント詳細

### GET `/api/grades` — 一覧取得

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `keyword` | string | 任意 | 学生名・学生ID・科目名の部分一致 |
| `letter` | string | 任意 | 評価フィルタ（`S`/`A`/`B`/`C`/`D`/`F`） |
| `year` | number | 任意 | 年度フィルタ |
| `semester` | string | 任意 | 学期フィルタ（`spring`/`fall`） |
| `page` | number | 任意 | ページ番号（デフォルト: 1） |
| `limit` | number | 任意 | 件数（デフォルト: 30） |

**レスポンス（200 OK）**

```json
{
  "data": [
    {
      "id": "uuid",
      "studentId": "S001",
      "studentName": "田中花子",
      "subject": "数学",
      "score": 85,
      "letter": "A",
      "year": 2026,
      "semester": "spring",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 30
}
```

---

### GET `/api/grades/:id` — 詳細取得

**レスポンス（200 OK）**

一覧の各要素と同じ形式のオブジェクトを返す。

---

### POST `/api/grades` — 登録

**リクエストボディ**

```json
{
  "studentId": "S001",
  "studentName": "田中花子",
  "subject": "数学",
  "score": 85,
  "year": 2026,
  "semester": "spring"
}
```

| フィールド | 型 | 必須 | バリデーション |
| --- | --- | --- | --- |
| `studentId` | string | 必須 | 1文字以上 |
| `studentName` | string | 必須 | 1文字以上 |
| `subject` | string | 必須 | 1文字以上 |
| `score` | number | 必須 | 整数 0〜100 |
| `year` | number | 必須 | 整数 2000以上 |
| `semester` | string | 必須 | `spring` or `fall` |

**レスポンス（201 Created）**

`letter`（評価）はサーバー側でスコアから自動計算して返す。

**エラー**
- 409: 同一 studentId・subject・year・semester の組み合わせが既に存在する

---

### PUT `/api/grades/:id` — 更新

**リクエストボディ**（POST と同じフィールド）

**レスポンス（200 OK）**

更新後のオブジェクトを返す。`letter` は更新されたスコアから再計算される。

---

### DELETE `/api/grades/:id` — 削除

**レスポンス（204 No Content）**

---

## スコア→評価換算ルール

| スコア | 評価 |
| --- | --- |
| 90〜100 | S |
| 80〜89 | A |
| 70〜79 | B |
| 60〜69 | C |
| 50〜59 | D |
| 0〜49 | F |

---

## エラーレスポンス共通仕様

| ステータス | 説明 |
| --- | --- |
| 400 | バリデーションエラー |
| 401 | 未認証 |
| 404 | 成績が存在しない |
| 409 | 重複登録 |
| 500 | サーバーエラー |

---

## 関連ドキュメント

- 機能設計書: `docs/features/grades/grades.md`
- DB設計書: `docs/database/grades/grades.md`
