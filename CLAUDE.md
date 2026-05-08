# CLAUDE.md

このファイルは Claude Code（claude.ai/code）が本リポジトリで作業する際のガイドです。

## プロジェクト概要

**npm workspaces** によるモノレポ構成。`frontend`（React）と `backend`（Hono + MySQL）で構成されています。

## モノレポ構成

```
claude-micro-app/          # ルート（workspaces 管理）
├── package.json           # npm workspaces の定義
├── frontend/              # React アプリ（Vite + React 18 + TypeScript）
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig*.json
│   ├── eslint.config.js
│   └── src/
└── backend/               # Hono API サーバ（Node.js + TypeScript）
    ├── package.json
    ├── tsconfig.json
    ├── drizzle.config.ts
    └── src/
```

## 開発コマンド

### ルートから全体を操作

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | frontend 開発サーバ起動（http://localhost:5173） |
| `npm run dev:backend` | backend 開発サーバ起動（http://localhost:3000） |
| `npm run build` | frontend + backend 本番ビルド |
| `npm run lint` | frontend ESLint 実行 |
| `npm run preview` | frontend ビルド成果物のローカルプレビュー |

### frontend ディレクトリで直接実行する場合

```bash
cd frontend
npm run dev / build / lint / preview
```

### backend ディレクトリで直接実行する場合

```bash
cd backend
npm run dev        # tsx watch による開発サーバ
npm run build      # tsc による本番ビルド
npm run test       # vitest によるテスト実行
npm run db:generate  # Drizzle マイグレーションファイル生成
npm run db:migrate   # マイグレーション適用
npm run db:studio    # Drizzle Studio 起動
```

変更後は最低限 `npm run lint`（frontend）と `npm run build` の両方を通すこと。

---

## frontend アーキテクチャ

**features-based（機能スライス型）** を採用。1機能 = 1フォルダで凝集度を高く保つことを最優先する。

### ディレクトリ構成

```
frontend/src/
├── app/                                     # ルーター・ナビゲーション設定
│   ├── config.ts
│   ├── navigation.ts
│   └── router.tsx
├── features/                                # 機能スライス
│   └── <feature>/
│       ├── components/                      # 機能の UI
│       ├── hooks/                           # 機能のロジック
│       ├── types.ts                         # （必要時）機能の型定義
│       ├── api.ts                           # （必要時）機能の API 呼び出し
│       └── index.ts                         # 公開 API（barrel）
├── shared/                                  # 機能横断の共通部品
│   ├── api/
│   ├── components/
│   ├── hooks/
│   └── types.ts
├── index.css
└── main.tsx                                 # エントリ + ErrorBoundary
```

将来的に汎用 UI 部品が増えたら `frontend/src/components/ui/`（Button, Input など）を新設する。

### レイヤー間の依存ルール

- **features 同士の直接 import は禁止**。共有が必要なら `shared/` に切り出す
- features → shared への依存は OK
- shared → features への依存は禁止
- 機能の外部公開は `features/<feature>/index.ts`（barrel）経由に統一する

### パスエイリアス

`@/*` → `src/*` を設定済み（[frontend/tsconfig.app.json](frontend/tsconfig.app.json), [frontend/vite.config.ts](frontend/vite.config.ts)）。深い相対パス（`../../`）は使わず、エイリアスを使う。

```ts
import { Counter } from '@/features/counter'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
```

## frontend コーディング規約

### React / TypeScript

- コンポーネントは関数コンポーネント + Hooks のみ。クラスコンポーネントは ErrorBoundary など React の制約上必要な場合のみ
- `tsconfig` は `strict: true` / `noUnusedLocals` / `noUnusedParameters` 有効。未使用変数は残さない
- 型のみの import は `import type { ... }` または `import { type Foo }` を使う
- props 型はコンポーネント直近で `type Props = { ... }` として定義する

### スタイル

- 現在は素の CSS（`frontend/src/index.css`）。コンポーネントスコープのスタイルが必要になったら CSS Modules を検討する

### エラーハンドリング

- アプリ全体は [frontend/src/shared/components/ErrorBoundary.tsx](frontend/src/shared/components/ErrorBoundary.tsx) で [frontend/src/main.tsx](frontend/src/main.tsx) からラップ済み
- 機能スコープでフォールバック UI が必要な場合は、その機能内に追加の ErrorBoundary を配置する

## 機能を追加するときの手順（frontend）

1. `frontend/src/features/<feature>/` を作成
2. `hooks/` にロジック、`components/` に UI を配置
3. `index.ts` で外部公開する API（コンポーネント・フック）を再エクスポート
4. 利用側は `import { X } from '@/features/<feature>'` で参照
5. ルートから `npm run lint` と `npm run build` を通す

参考実装: [frontend/src/features/counter/](frontend/src/features/counter/)

---

## backend アーキテクチャ

**Hono**（Node.js）+ **Drizzle ORM**（MySQL）+ **Zod** によるバリデーション。

### ディレクトリ構成

```
backend/src/
├── features/                  # 機能スライス
│   └── <feature>/
│       ├── routes.ts          # OpenAPIHono ルート定義（createRoute + openapi()）
│       ├── service.ts         # ビジネスロジック
│       └── repository.ts      # DB アクセス（Drizzle）
├── db/
│   ├── index.ts               # DB 接続（mysql2 + Drizzle）
│   └── schema/                # Drizzle スキーマ定義
├── shared/
│   ├── middleware/
│   │   ├── auth.ts            # JWT 認証・管理者権限ミドルウェア
│   │   └── error.ts           # グローバルエラーハンドラ
│   ├── errors.ts              # AppError サブクラス群
│   └── types.ts               # HonoEnv・JwtPayload など共通型
├── lib/
│   ├── jwt.ts                 # JWT 署名・検証
│   ├── password.ts            # bcrypt ハッシュ・比較
│   └── email.ts               # nodemailer によるメール送信（Mailhog）
├── app.ts                     # OpenAPIHono インスタンス生成・ルート登録
└── index.ts                   # @hono/node-server でサーバ起動
```

### 実装済み機能

| 機能 | パス | 認証 |
| --- | --- | --- |
| ログイン | `POST /api/auth/login` | 不要 |
| パスワード変更 | `POST /api/auth/change-password` | 要認証 |
| パスワードリセット要求 | `POST /api/auth/reset-password/request` | 不要 |
| パスワードリセット確定 | `POST /api/auth/reset-password/confirm` | 不要 |
| ユーザー管理 | `/api/users` | admin のみ |
| 成績管理 | `/api/grades` | 要認証 |
| お知らせ管理 | `/api/announcements` | 要認証（書き込みは admin のみ） |
| バッチ管理 | `/api/batches` | admin のみ |

### Swagger / OpenAPI

- `@hono/zod-openapi`（v0.19.x、Zod v3 対応版）でルートを定義する
- ルート追加時は必ず `createRoute` を使い、`summary`（日本語）・`description` を記載する
- セキュリティが必要なルートには `security: [{ bearerAuth: [] }]` を付与する
- OpenAPI スペック: `GET /openapi.json`
- Swagger UI: `GET /docs`

### ルート追加の手順（backend）

1. `backend/src/features/<feature>/routes.ts` に `createRoute` でルートを定義
2. `OpenAPIHono<HonoEnv>` インスタンスに `.openapi(route, handler)` で登録
3. `backend/src/app.ts` の `createApp` 内で `app.route('/api/<feature>', <feature>Routes)` を追加
4. `npm run build -w backend` を通す

### 環境変数

`backend/.env` で管理（`.env.example` を参照）。

| 変数 | 説明 |
| --- | --- |
| `PORT` | サーバポート（デフォルト: 3000） |
| `CORS_ORIGIN` | フロントエンドのオリジン |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL 接続情報 |
| `JWT_SECRET` | JWT 署名シークレット（本番では必ず変更する） |
| `SMTP_HOST` | SMTP サーバホスト（開発: `localhost`） |
| `SMTP_PORT` | SMTP サーバポート（開発: `1025` = Mailhog） |
| `SMTP_FROM` | 送信元メールアドレス |
| `APP_URL` | フロントエンドの URL（リセットメールのリンク生成に使用） |

---

## やらないこと

- 過剰な抽象化（将来の要件を見越したラッパー、ジェネリック化など）。3つ以上の重複が出てから抽象化する
- features 同士の相互参照（コードが一気に絡まる）
- 状態管理ライブラリの先行導入。必要になってから追加する
