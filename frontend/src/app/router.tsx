import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/features/auth'
import { AdminPage, AdminAnnouncementsPage, AdminAnnouncementFormPage, AdminBatchesPage } from '@/features/admin'
import { AnnouncementsPage } from '@/features/announcements'
import { DashboardPage } from '@/features/dashboard'
import { GradesPage, GradeDetailPage, GradeEditPage, GradeCreatePage } from '@/features/grades'
import { UsersPage, UserDetailPage, UserCreatePage } from '@/features/users'
import { AppLayout } from '@/shared/components/layout/AppLayout'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { AdminRoute } from '@/shared/components/AdminRoute'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'admin', element: <AdminRoute><AdminPage /></AdminRoute> },
      { path: 'admin/announcements', element: <AdminRoute><AdminAnnouncementsPage /></AdminRoute> },
      { path: 'admin/announcements/new', element: <AdminRoute><AdminAnnouncementFormPage /></AdminRoute> },
      { path: 'admin/announcements/:id/edit', element: <AdminRoute><AdminAnnouncementFormPage /></AdminRoute> },
      { path: 'admin/batches', element: <AdminRoute><AdminBatchesPage /></AdminRoute> },
      { path: 'grades', element: <GradesPage /> },
      { path: 'grades/new', element: <GradeCreatePage /> },
      { path: 'grades/:id', element: <GradeDetailPage /> },
      { path: 'grades/:id/edit', element: <GradeEditPage /> },
      { path: 'users', element: <AdminRoute><UsersPage /></AdminRoute> },
      { path: 'users/new', element: <AdminRoute><UserCreatePage /></AdminRoute> },
      { path: 'users/:id', element: <AdminRoute><UserDetailPage /></AdminRoute> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
