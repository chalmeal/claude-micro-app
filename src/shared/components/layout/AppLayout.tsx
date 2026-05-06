import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/shared/components/layout/Header'
import { Sidebar } from '@/shared/components/layout/Sidebar'
import './AppLayout.css'

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="app-layout" data-sidebar-collapsed={sidebarCollapsed}>
      <Header />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />
      <main className="app-layout__main">
        <Outlet />
      </main>
    </div>
  )
}
