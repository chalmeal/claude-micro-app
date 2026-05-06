# CLAUDE.md

このファイルは Claude Code(claude.ai/code)が本リポジトリで作業する際のガイドです。

## プロジェクト概要

**npm workspaces** によるモノレポ構成。現時点では `frontend` パッケージのみ実装済み。`backend` は今後追加予定。

## モノレポ構成

```
claude-micro-app/          # ルート(workspaces 管理)
├── package.json           # npm workspaces の定義
├── frontend/              # React アプリ(Vite + React 18 + TypeScript)
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig*.json
│   ├── eslint.config.js
│   └── src/
└── backend/               # (未実装)将来のバックエンド
```

## 開発コマンド

### ルートから全体を操作

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | frontend 開発サーバ起動(http://localhost:5173) |
| `npm run build` | frontend 本番ビルド |
| `npm run lint` | frontend ESLint 実行 |
| `npm run preview` | frontend ビルド成果物のローカルプレビュー |

### frontend ディレクトリで直接実行する場合

```bash
cd frontend
npm run dev / build / lint / preview
```

変更後は最低限 `npm run lint` と `npm run build` の両方を通すこと。

## frontend アーキテクチャ

**features-based(機能スライス型)** を採用。1機能 = 1フォルダで凝集度を高く保つことを最優先する。

### ディレクトリ構成

```
frontend/src/
├── app/                                     # ルーター・ナビゲーション設定
│   ├── config.ts
│   ├── navigation.ts
│   └── router.tsx
├── features/                                # 機能スライス
│   └── <feature>/
│       ├── components/                      # 機能のUI
│       ├── hooks/                           # 機能のロジック
│       ├── types.ts                         # (必要時)機能の型定義
│       ├── api.ts                           # (必要時)機能のAPI呼び出し
│       └── index.ts                         # 公開API(barrel)
├── shared/                                  # 機能横断の共通部品
│   ├── api/
│   ├── components/
│   ├── hooks/
│   └── types.ts
├── index.css
└── main.tsx                                 # エントリ + ErrorBoundary
```

将来的に汎用 UI 部品が増えたら `frontend/src/components/ui/`(Button, Input など)を新設する。

### レイヤー間の依存ルール

- **features 同士の直接 import は禁止**。共有が必要なら `shared/` に切り出す
- features → shared への依存は OK
- shared → features への依存は禁止
- 機能の外部公開は `features/<feature>/index.ts`(barrel)経由に統一する

### パスエイリアス

`@/*` → `src/*` を設定済み([frontend/tsconfig.app.json](frontend/tsconfig.app.json), [frontend/vite.config.ts](frontend/vite.config.ts))。深い相対パス(`../../`)は使わず、エイリアスを使う。

```ts
import { Counter } from '@/features/counter'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
```

## コーディング規約

### React / TypeScript

- コンポーネントは関数コンポーネント + Hooks のみ。クラスコンポーネントは ErrorBoundary など React の制約上必要な場合のみ
- `tsconfig` は `strict: true` / `noUnusedLocals` / `noUnusedParameters` 有効。未使用変数は残さない
- 型のみの import は `import type { ... }` または `import { type Foo }` を使う
- props 型はコンポーネント直近で `type Props = { ... }` として定義する

### スタイル

- 現在は素の CSS(`frontend/src/index.css`)。コンポーネントスコープのスタイルが必要になったら CSS Modules を検討する

### エラーハンドリング

- アプリ全体は [frontend/src/shared/components/ErrorBoundary.tsx](frontend/src/shared/components/ErrorBoundary.tsx) で [frontend/src/main.tsx](frontend/src/main.tsx) からラップ済み
- 機能スコープでフォールバックUIが必要な場合は、その機能内に追加の ErrorBoundary を配置する

## 機能を追加するときの手順(frontend)

1. `frontend/src/features/<feature>/` を作成
2. `hooks/` にロジック、`components/` に UI を配置
3. `index.ts` で外部公開する API(コンポーネント・フック)を再エクスポート
4. 利用側は `import { X } from '@/features/<feature>'` で参照
5. ルートから `npm run lint` と `npm run build` を通す

参考実装: [frontend/src/features/counter/](frontend/src/features/counter/)

## やらないこと

- 過剰な抽象化(将来の要件を見越したラッパー、ジェネリック化など)。3つ以上の重複が出てから抽象化する
- features 同士の相互参照(コードが一気に絡まる)
- バックエンドや状態管理ライブラリの先行導入。必要になってから追加する
