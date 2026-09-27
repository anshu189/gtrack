import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AppShell, TabBar } from '@/components/ds'
import Dashboard from '@/pages/Dashboard'
import MealBuilder from '@/pages/MealBuilder'
import History from '@/pages/History'
import Analytics from '@/pages/Analytics'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { BarChart3, Clock, Home, UtensilsCrossed, Settings2 } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: Home, path: '/' },
  { label: 'Meals', icon: UtensilsCrossed, path: '/meals' },
  { label: 'History', icon: Clock, path: '/history' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Settings', icon: Settings2, path: '/settings' },
]

function App() {
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)
  const init = useAuthStore((s) => s.init)

  useEffect(() => init(), [init])

  if (!initialized) {
    return <div className="flex min-h-screen items-center justify-center bg-canvas"><p className="body-text text-ink-2">Loading…</p></div>
  }

  if (!user) {
    return <Login />
  }

  return <AppLayout />
}

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const settingsStore = useSettingsStore()

  useEffect(() => {
    settingsStore.load()
  }, [])

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    active: location.pathname === item.path,
    onClick: () => navigate(item.path),
  }))

  return (
    <AppShell
      header={
        <a href="/" className="inline-flex items-center gap-3" aria-label="Gtrak home">
          <span className="flex h-12 w-12 items-center justify-center gap-[6px] rounded-lg bg-black">
            <span className="h-[5px] w-[5px] rounded-pill bg-on-ink" />
            <span className="h-[5px] w-[5px] rounded-pill bg-on-ink" />
            <span className="h-[5px] w-[5px] rounded-pill bg-on-ink" />
          </span>
          <span className="flex flex-col">
            <span className="title-2 text-black">Gtrak</span>
            <span className="caption text-ink-2">Growth Tracker for G's</span>
          </span>
        </a>
      }
      tabBar={<TabBar items={navItems} />}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/meals" element={<MealBuilder />} />
        <Route path="/history" element={<History />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AppShell>
  )
}

export default App
