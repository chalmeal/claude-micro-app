# claude-micro-app

Claude Code + React Micro application

## はじめに

本リポジトリはClaude Codeを使用してReact Micro applicationを作成します。AI駆動によるセットアップを行うことができ、プロジェクトを立ち上げを迅速に行うことができます。

## 環境構築

```bash
npm install
```

## 実行

```bash
npm run dev
```

## アーキテクチャ

本リポジトリは小規模アプリ向けに **features-based(機能スライス型)** アーキテクチャを採用しています。1つの機能(feature)ごとに 1 フォルダを割り当て、UI・ロジック・型などの関心事を機能単位で凝集させます。

### ディレクトリ構成

```
src/
├── App.tsx                                  # ルート画面のレイアウト
├── main.tsx                                 # エントリ + ErrorBoundary
├── features/                                # 機能スライス
│   └── counter/
│       ├── components/Counter.tsx           # 機能のUI
│       ├── hooks/useCounter.ts              # 機能のロジック
│       └── index.ts                         # 機能の公開API(barrel)
└── shared/                                  # 機能横断の共通部品
    └── components/ErrorBoundary.tsx
```

### 各レイヤーの責務

| レイヤー | 責務 | 例 |
| --- | --- | --- |
| `features/<feature>/` | 1機能で閉じる UI・ロジック・型・API 呼び出し | `features/counter/` |
| `shared/` | 複数 feature で共有する純粋な部品やユーティリティ | `ErrorBoundary` |
| `components/ui/`(必要時に新設) | デザインシステム的な汎用 UI 部品 | `Button`, `Input` |
| `App.tsx` / `main.tsx` | アプリ全体の構成・初期化 | ルーティング、Provider |

### 機能を追加するときのルール

- 新機能は `src/features/<feature>/` に 1 フォルダで追加し、`components/`・`hooks/`・必要なら `types.ts` / `api.ts` を同梱する
- 機能の外部公開 API は `features/<feature>/index.ts`(barrel)に集約する
- features 同士の直接 import は避け、共有が必要なら `shared/` に切り出す
- 汎用 UI 部品が増えてきたら `src/components/ui/` を新設する

### パスエイリアス

`@/*` → `src/*` のエイリアスを設定済みです。深い相対パスは避け、エイリアスを使用してください。

```ts
import { Counter } from '@/features/counter'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
```

## スクリプト

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | 開発サーバを起動(http://localhost:5173) |
| `npm run build` | 型チェック + 本番ビルド |
| `npm run lint` | ESLint による静的解析 |
| `npm run preview` | ビルド成果物のローカルプレビュー |