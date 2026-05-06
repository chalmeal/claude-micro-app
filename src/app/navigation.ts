export type NavItem = {
  label: string
  to: string
  end?: boolean
  icon: string
}

import { appConfig } from '@/app/config'
export const APP_NAME = appConfig.name

export const navigation: NavItem[] = [
  { label: 'ダッシュボード', to: '/', end: true, icon: 'dashboard' },
  { label: 'ユーザー', to: '/users', icon: 'users' },
  { label: '管理', to: '/admin', icon: 'admin' },
]
