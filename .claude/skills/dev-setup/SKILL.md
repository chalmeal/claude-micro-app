---
name: dev-setup
description: テンプレートリポジトリのセットアップ。成績ドメインを削除し、アプリ名・説明・ブランドカラーを設定して開発をスタートできる状態にする。"dev-setup", "セットアップ", "テンプレートを初期化", "開発環境をセットアップ" などのフレーズで起動する。
---

# dev-setup

このスキルは `claude-micro-app` テンプレートを新規アプリ開発の出発点として初期化します。
テンプレートに含まれる「成績管理」ドメイン（grades）を削除し、アプリ固有の設定を反映します。

## Step 1: 開発者にヒアリングする

コードを書く前に、以下の 3 点を **1 つのメッセージ** でまとめて質問する。

1. **アプリ名**（ブラウザタブ・ヘッダーに表示される名前）
2. **補足説明（description）**（ヘッダー下に小さく表示されるサブテキスト）
3. **ブランドカラー**（HEX 値。例: `#10b981`）

ユーザーがすでに答えを伝えていればその質問は省略する。

## Step 2: config.ts を更新する

`frontend/src/app/config.ts` の `appConfig` をヒアリング結果で書き換える。

```ts
export const appConfig = {
  name: '<アプリ名>',
  description: '<補足説明>',
  brandColor: '<ブランドカラー HEX>',
} as const
```

## Step 3: 成績ドメインを削除する

以下のファイル・ディレクトリを削除する。

### Frontend

```bash
rm -rf frontend/src/features/grades
```

`frontend/src/app/router.tsx` から grades 関連の import とルートを削除する。

```ts
// 削除対象の import
import { GradesPage, GradeDetailPage, GradeEditPage, GradeCreatePage } from '@/features/grades'

// 削除対象のルート
{ path: 'grades', element: <GradesPage /> },
{ path: 'grades/new', element: <GradeCreatePage /> },
{ path: 'grades/:id', element: <GradeDetailPage /> },
{ path: 'grades/:id/edit', element: <GradeEditPage /> },
```

`frontend/src/app/navigation.ts` から grades のナビアイテムを削除する。

```ts
// 削除対象
{ label: '成績', to: '/grades', icon: 'grades' },
```

### Backend

```bash
rm -rf backend/src/features/grades
rm -f  backend/src/db/schema/grades.ts
```

`backend/src/db/schema/index.ts` から grades の export を削除する。

`backend/src/app.ts` から grades ルートの import と登録を削除する。

### DB マイグレーション

grades テーブルのマイグレーションファイルを削除し、`backend/drizzle/meta/_journal.json` から該当エントリを除去する。

```bash
# grades マイグレーションのファイル名は環境によって異なるため、
# ls backend/drizzle/ で確認してから削除する
```

## Step 4: ビルドを通す

```bash
npm run lint
npm run build
npm test -w frontend
```

エラーがあれば修正してから完了を報告する。

## Step 5: 完了を報告する

```
セットアップ完了

設定:
  アプリ名:     <name>
  説明:         <description>
  ブランドカラー: <brandColor>

削除したドメイン:
  - frontend/src/features/grades
  - backend/src/features/grades
  - backend/src/db/schema/grades.ts
  - grades 関連のルート・ナビ・マイグレーション

次のステップ:
  1. 新しい機能を features/ に追加する
  2. router.tsx と navigation.ts に新ルート・ナビを追加する
  3. npm run dev / npm run dev:backend で開発サーバを起動する
```
