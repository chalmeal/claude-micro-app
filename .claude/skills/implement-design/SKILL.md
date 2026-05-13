---
name: implement-design
description: 設計書をもとに実装を行うスキル。docs/ 配下の設計書（機能・画面・API・DB）を読み込み、その内容に従って backend + frontend を実装する。"設計書から実装", "設計書をもとに実装", "〜の設計書を実装", "implement-design", "implement design" などのフレーズで起動する。
---

# implement-design

このスキルは `docs/` 配下の設計書を読み込み、その内容に従って backend + frontend を実装します。

---

## Step 1: 対象ドメインの確認

実装するドメイン名（英語スラッグ）を確認する。ユーザーがすでに伝えていれば省略する。

例: 「どのドメインの設計書を実装しますか？（例: orders）」

---

## Step 2: 設計書を読み込む

以下の設計書を**すべて読む**。存在しないファイルはスキップする。

```
docs/features/<slug>/<slug>.md     # 機能設計書
docs/screens/<slug>/*.md           # 画面設計書（全画面分）
docs/api/<slug>/<slug>.md          # API設計書
docs/database/<slug>/<slug>.md     # DB設計書
```

読み込んだら、以下を整理して実装前にユーザーに提示する。

```
実装対象のサマリー
──────────────────
ドメイン: <slug>
DBテーブル: <テーブル名・カラム一覧>
APIエンドポイント: <メソッド + パス 一覧>
フロントエンド画面: <画面名 + パス 一覧>
認証要件: <要認証 / 管理者のみ / など>
```

設計書に不足・矛盾がある場合はこのタイミングでユーザーに質問する。
曖昧な点がなければ「この内容で実装を開始します」と伝えて進む。

---

## Step 3: Backend 実装

設計書の **DB設計書** と **API設計書** に従って実装する。

### 3-1. スキーマ定義

`backend/src/db/schema/<slug>.ts` を作成する。

- DB設計書のカラム定義をそのまま Drizzle スキーマに変換する
- 論理削除カラム（`deleted_at`）が設計書に含まれる場合は追加する
- `backend/src/db/schema/index.ts` に `export * from './<slug>.js'` を追加する

### 3-2. Repository

`backend/src/features/<slug>/repository.ts` を作成する。

- API設計書の各エンドポイントに必要なデータアクセスメソッドを実装する
- 論理削除が設計書に含まれる場合は `deletedAt IS NULL` フィルタを使用する
- 検索条件はAPI設計書のクエリパラメータに合わせる

### 3-3. Service

`backend/src/features/<slug>/service.ts` を作成する。

- API設計書のビジネスロジック（バリデーション・重複チェック・計算ロジックなど）を実装する
- 設計書に記載されたエラーケース（404・409など）は `NotFoundError` / `ConflictError` で対応する

### 3-4. Routes

`backend/src/features/<slug>/routes.ts` を作成する。

- API設計書に記載された全エンドポイントを `createRoute` + `openapi()` で定義する
- 各ルートの認証要件を設計書の「認証」列に従って設定する（`authMiddleware` / `adminMiddleware`）
- Zodスキーマはリクエスト・レスポンスの型定義に合わせて定義する

### 3-5. app.ts に登録

`backend/src/app.ts` に import と `app.route('/api/<slug>', <slug>Routes)` を追加する。

### 3-6. Backend テスト

`backend/src/features/<slug>/service.test.ts` を作成する（vitest）。
設計書の受け入れ条件に対応するテストケースを網羅する。

---

## Step 4: マイグレーション

```bash
npm run db:generate -w backend
npm run db:migrate -w backend
```

エラーが出た場合はスキーマ定義を修正してから再実行する。

---

## Step 5: Frontend 実装

設計書の **画面設計書** と **API設計書** に従って実装する。

### 5-1. 型定義

`frontend/src/features/<slug>/types.ts` を作成する。

- API設計書のレスポンス型を TypeScript 型として定義する
- 画面で使う状態型（フィルタ条件など）も定義する

### 5-2. API クライアント

`frontend/src/features/<slug>/api/<slug>.ts` を作成する。

- API設計書の全エンドポイントに対応した関数を実装する
- `apiFetch` を使用する

### 5-3. Hooks

`frontend/src/features/<slug>/hooks/` に一覧用・単件用フックを作成する。

- 画面設計書の「使用するAPI」に基づいて必要なフックを判断する

### 5-4. コンポーネント・ページ

`frontend/src/features/<slug>/components/` と `frontend/src/features/<slug>/pages/` を作成する。

画面設計書の各画面について以下を実装する。

- **ワイヤーフレーム**に沿ったレイアウト
- **コンポーネント一覧**に記載された各UIパーツ
- **状態と表示**に記載されたローディング・エラー・空状態
- **ユーザー操作と挙動**に記載されたイベントハンドリング
- `ConfirmDialog` / `ErrorAlert` / `SkeletonRows` / `PageHeader` などの共有コンポーネントを活用する

### 5-5. Barrel

`frontend/src/features/<slug>/index.ts` で全ページコンポーネントをエクスポートする。

### 5-6. Router と Navigation に登録

`frontend/src/app/router.tsx` に画面設計書の**パス**に基づいてルートを追加する。  
`frontend/src/app/navigation.ts` にナビゲーション項目を追加する（ナビ不要なルートはスキップ）。

---

## Step 6: Frontend テスト

`frontend/src/features/<slug>/components/__tests__/` にコンポーネントテストを追加する。

テスト対象の優先順位:
1. 純粋関数（CSV パース・計算ロジックなど）
2. リスト/テーブルコンポーネントの表示テスト

**ESM モードの注意**: `jest.fn()` 等を使うファイルは先頭に以下を追加する。
```ts
import { jest } from '@jest/globals'
```

---

## Step 7: ビルドと確認

```bash
npm run lint
npm run build
npm test -w frontend
npm run test -w backend
```

エラーがあれば修正してから完了を報告する。

---

## Step 8: 完了報告

```
実装完了: <ドメイン名>（設計書ベース）

Backend:
  <API設計書のエンドポイント一覧をそのまま列挙>

Frontend:
  <画面設計書の画面名 + パス一覧をそのまま列挙>

Migration: 適用済み
Tests: <作成したテストファイル名>

設計書との差異:
  <実装時に設計書から変更した点があれば記載。なければ「なし」>
```

---

## 全体を通じての注意事項

- **設計書が仕様の正として実装する**。設計書に書かれていない機能は追加しない
- 設計書に不足がある場合（型定義が曖昧・認証要件が未記載など）は Step 2 でユーザーに確認する
- 実装時に設計書から変更せざるを得ない箇所が生じた場合は完了報告に明記し、設計書も同時に更新する
