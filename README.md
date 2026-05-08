# claude-micro-app

Claude Code + React / Hono のフルスタック Micro アプリケーション

## 概要

npm workspaces によるモノレポ構成。フロントエンド（React）とバックエンド（Hono + MySQL）で構成されます。

## 環境構築

Dev Container（Docker Compose）での起動を推奨します。VS Code の「Reopen in Container」で起動すると、MySQL・Mailhog を含む開発環境が自動的にセットアップされます。

## 初回セットアップ

コンテナ起動後、以下の手順を順番に実行してください。

### 1. 依存関係のインストール

```bash
npm install
```

### 2. DB マイグレーション

Drizzle のマイグレーションを適用してテーブルを作成します。

```bash
npm run db:migrate -w backend
```

### 3. 初期データの投入

ユーザー 50 件・お知らせ 15 件・成績 3,000 件のサンプルデータを投入します。

```bash
npm run db:seed -w backend
```

### 4. 開発サーバの起動

フロントエンドとバックエンドをそれぞれ別ターミナルで起動します。

```bash
# バックエンド（http://localhost:3000）
npm run dev:backend

# フロントエンド（http://localhost:5173）
npm run dev
```

### 5. ログイン

ブラウザで http://localhost:5173 を開き、以下のアカウントでログインします。

| メールアドレス | パスワード | ロール |
| --- | --- | --- |
| `admin@example.com` | `password123` | 管理者 |
| `taro.yamada@example.com` | `password123` | メンバー |

> シードで作成したすべてのユーザーのパスワードは `password123` です。  
> ログイン後、「パスワード変更」から変更できます。

---

## 開発サーバの起動（2 回目以降）

```bash
# バックエンド（http://localhost:3000）
npm run dev:backend

# フロントエンド（http://localhost:5173）
npm run dev
```

## スクリプト一覧

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | フロントエンド開発サーバを起動 |
| `npm run dev:backend` | バックエンド開発サーバを起動 |
| `npm run build` | フロントエンド + バックエンドを本番ビルド |
| `npm run lint` | フロントエンド ESLint を実行 |
| `npm run preview` | フロントエンドビルド成果物のローカルプレビュー |
| `npm run db:migrate -w backend` | DB マイグレーションを適用 |
| `npm run db:seed -w backend` | サンプルデータを投入 |
| `npm run db:generate -w backend` | スキーマ変更からマイグレーションファイルを生成 |
| `npm run db:studio -w backend` | Drizzle Studio（DB GUI）を起動 |

## API ドキュメント

バックエンド起動後、以下の URL で Swagger UI を確認できます。

| URL | 内容 |
| --- | --- |
| http://localhost:3000/docs | Swagger UI |
| http://localhost:3000/openapi.json | OpenAPI スペック（JSON） |

「Authorize」ボタンに `/api/auth/login` で取得した JWT を入力することで、認証が必要なエンドポイントも試せます。

## メール確認（開発環境）

開発環境ではメール送信に [Mailhog](https://github.com/mailhog/MailHog) を使用します。パスワードリセットメールなど、アプリが送信したメールは以下の URL で確認できます。

| URL | 内容 |
| --- | --- |
| http://localhost:8025 | Mailhog Web UI |

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
│   ├── auth/           # 認証・パスワード変更・パスワードリセット
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

**ログイン**
1. `POST /api/auth/login` でメールアドレスとパスワードを送信して JWT を取得
2. 以降のリクエストは `Authorization: Bearer <token>` ヘッダで認証
3. 管理者専用エンドポイントはさらに `role: admin` を検証

**パスワードリセット**
1. `POST /api/auth/reset-password/request` にメールアドレスを送信（未登録でも同じ 200 を返す）
2. 登録済みの場合、1 時間有効なリセットリンクをメール送信
3. リンクから遷移した画面で `POST /api/auth/reset-password/confirm` に新パスワードを送信
