import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/shared/components/layout/Header'
import { Sidebar } from '@/shared/components/layout/Sidebar'
import './AppLayout.css'

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="app-layout" data-sidebar-collapsed={sidebarCollapsed}>
      <Header onMenuClick={() => setMobileOpen((o) => !o)} />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      {mobileOpen && (
        <div
          className="app-layout__backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <main className="app-layout__main">
        <Outlet />
      </main>
    </div>
  )
}
