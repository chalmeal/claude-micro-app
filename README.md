# claude-micro-app

Claude Code + React / Hono のフルスタック Micro アプリケーション

## 概要

npm workspaces によるモノレポ構成。フロントエンド（React）とバックエンド（Hono + MySQL）で構成されます。

## 環境構築

Dev Container（Docker Compose）での起動を推奨します。VS Code の「Reopen in Container」で起動すると、MySQL を含む開発環境が自動的にセットアップされます。

コンテナ起動後に依存関係をインストールします。

```bash
npm install
```

## 開発サーバの起動

```bash
# フロントエンド（http://localhost:5173）
npm run dev

# バックエンド（http://localhost:3000）
npm run dev:backend
```

## スクリプト一覧

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | フロントエンド開発サーバを起動 |
| `npm run dev:backend` | バックエンド開発サーバを起動 |
| `npm run build` | フロントエンド + バックエンドを本番ビルド |
| `npm run lint` | フロントエンド ESLint を実行 |
| `npm run preview` | フロントエンドビルド成果物のローカルプレビュー |

## API ドキュメント

バックエンド起動後、以下の URL で Swagger UI を確認できます。

| URL | 内容 |
| --- | --- |
| http://localhost:3000/docs | Swagger UI |
| http://localhost:3000/openapi.json | OpenAPI スペック（JSON） |

「Authorize」ボタンに `/api/auth/login` で取得した JWT を入力することで、認証が必要なエンドポイントも試せます。

## アーキテクチャ

### モノレポ構成

```
claude-micro-app/
├── package.json        # npm workspaces の定義
├── frontend/           # React アプリ（Vite + React 18 + TypeScript）
└── backend/            # Hono API サーバ（Node.js + TypeScript）
```

### フロントエンド

**features-based（機能スライス型）** アーキテクチャを採用。1機能 = 1フォルダで凝集度を高く保ちます。

```
frontend/src/
├── app/                # ルーター・ナビゲーション設定
├── features/           # 機能スライス（機能ごとに components / hooks / index.ts）
├── shared/             # 機能横断の共通部品
├── index.css
└── main.tsx            # エントリ + ErrorBoundary
```

### バックエンド

**features-based** で統一。各機能が routes / service / repository の 3 層で構成されます。

```
backend/src/
├── features/           # 機能スライス（routes / service / repository）
│   ├── auth/           # 認証・パスワード変更
│   ├── users/          # ユーザー管理（管理者専用）
│   ├── grades/         # 成績管理
│   ├── announcements/  # お知らせ管理
│   └── batches/        # バッチジョブ管理（管理者専用）
├── db/                 # Drizzle ORM スキーマ・接続設定
├── shared/             # 共通ミドルウェア・エラー・型定義
├── lib/                # JWT・パスワードユーティリティ
├── app.ts              # Hono アプリ生成・ルーティング登録
└── index.ts            # サーバ起動エントリ
```

### 技術スタック

| 項目 | フロントエンド | バックエンド |
| --- | --- | --- |
| 言語 | TypeScript | TypeScript |
| フレームワーク | React 18 | Hono |
| ビルド | Vite | tsc |
| DB | — | MySQL 8.0 + Drizzle ORM |
| 認証 | — | JWT（Bearer トークン） |
| バリデーション | — | Zod |
| API ドキュメント | — | Swagger UI（`@hono/zod-openapi`） |

### 認証フロー

1. `POST /api/auth/login` でメールアドレスとパスワードを送信して JWT を取得
2. 以降のリクエストは `Authorization: Bearer <token>` ヘッダで認証
3. 管理者専用エンドポイントはさらに `role: admin` を検証
