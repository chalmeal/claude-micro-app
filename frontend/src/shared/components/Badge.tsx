import './Badge.css'

type RoleBadgeProps = { role: 'admin' | 'member' }
const ROLE_LABEL: Record<RoleBadgeProps['role'], string> = { admin: '管理者', member: 'メンバー' }

export function RoleBadge({ role }: RoleBadgeProps) {
  return <span className={`badge badge--role-${role}`}>{ROLE_LABEL[role]}</span>
}

type StatusBadgeProps = { status: 'active' | 'inactive' }
const STATUS_LABEL: Record<StatusBadgeProps['status'], string> = { active: '有効', inactive: '無効' }

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status status--${status}`}>
      <span className="status__dot" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  )
}

export type GradeLetter = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'
const GRADE_CLASS: Record<GradeLetter, string> = {
  S: 'grade-badge--s',
  A: 'grade-badge--a',
  B: 'grade-badge--b',
  C: 'grade-badge--c',
  D: 'grade-badge--d',
  F: 'grade-badge--f',
}

type GradeBadgeProps = { letter: GradeLetter; className?: string }

export function GradeBadge({ letter, className }: GradeBadgeProps) {
  const cls = ['grade-badge', GRADE_CLASS[letter], className].filter(Boolean).join(' ')
  return <span className={cls}>{letter}</span>
}

type AuditBadgeProps = { action: string; label: string }

export function AuditBadge({ action, label }: AuditBadgeProps) {
  const category = action.split('.')[0]
  return <span className={`audit-badge audit-badge--${category}`}>{label}</span>
}

export type AnnouncementCategory = 'important' | 'info' | 'maintenance'
const CATEGORY_LABEL: Record<AnnouncementCategory, string> = {
  important: '重要',
  info: 'お知らせ',
  maintenance: 'メンテナンス',
}

type CategoryBadgeProps = { category: AnnouncementCategory }

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className={`announcement-badge announcement-badge--${category}`}>
      {CATEGORY_LABEL[category]}
    </span>
  )
}
