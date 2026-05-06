import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/features/auth'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { SnackbarProvider } from '@/shared/components/Snackbar'
import { appConfig } from '@/app/config'
import { router } from '@/app/router'
import './index.css'

document.title = appConfig.name
document.documentElement.style.setProperty('--color-primary', appConfig.brandColor)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <SnackbarProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </SnackbarProvider>
    </ErrorBoundary>
  </StrictMode>,
)
