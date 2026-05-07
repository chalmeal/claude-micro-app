import type { BatchSchedule } from '../db/schema/batches.js'

export type { BatchSchedule }

export type Role = 'admin' | 'member'
export type UserStatus = 'active' | 'inactive'
export type GradeLetter = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'
export type AnnouncementCategory = 'important' | 'info' | 'maintenance'
export type BatchStatus = 'success' | 'failed' | 'running' | 'pending'
export type LogLevel = 'info' | 'warn' | 'error'

export type JwtPayload = {
  sub: string
  email: string
  role: Role
  exp?: number
}

export type HonoEnv = {
  Variables: {
    jwtPayload: JwtPayload
  }
}
