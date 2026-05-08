/**
 * アプリケーション設定
 *
 * テンプレートから新しいアプリを作成する際はここを編集してください。
 * name / description / brandColor を変更するだけで
 * ブラウザタブ・ヘッダー・テーマカラーに一括反映されます。
 */
export const appConfig = {
  /** アプリ名（ブラウザタブ・ヘッダーに表示） */
  name: 'claude-micro-app',

  /** 補足説明（ヘッダーブランド名の下に小さく表示） */
  description: '成績管理アプリ',

  /**
   * ブランドカラー（HEX）
   * 変更するとボタン・リンク・アクティブ状態など UI 全体のテーマに反映されます。
   */
  brandColor: '#2563EB',
} as const
