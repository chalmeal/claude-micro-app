export type NavItem = {
  label: string
  to: string
  end?: boolean
  icon: string
  adminOnly?: boolean
}

import { appConfig } from '@/app/config'
export const APP_NAME = appConfig.name

export const navigation: NavItem[] = [
  { label: 'ダッシュボード', to: '/', end: true, icon: 'dashboard' },
  { label: '成績', to: '/grades', icon: 'grades' },
  { label: 'ユーザー', to: '/users', icon: 'users', adminOnly: true },
  { label: '管理', to: '/admin', icon: 'admin', adminOnly: true },
]
