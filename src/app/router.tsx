import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/features/auth'
import { AdminPage, AdminAnnouncementsPage, AdminAnnouncementFormPage, AdminBatchesPage } from '@/features/admin'
import { AnnouncementsPage } from '@/features/announcements'
import { DashboardPage } from '@/features/dashboard'
import { UsersPage, UserDetailPage, UserCreatePage } from '@/features/users'
import { AppLayout } from '@/shared/components/layout/AppLayout'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'

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
      { path: 'admin', element: <AdminPage /> },
      { path: 'admin/announcements', element: <AdminAnnouncementsPage /> },
      { path: 'admin/announcements/new', element: <AdminAnnouncementFormPage /> },
      { path: 'admin/announcements/:id/edit', element: <AdminAnnouncementFormPage /> },
      { path: 'admin/batches', element: <AdminBatchesPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'users/new', element: <UserCreatePage /> },
      { path: 'users/:id', element: <UserDetailPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
