import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AppShell } from '@/components/ui/app-shell'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import Dashboard from '@/pages/Dashboard'
import MealBuilder from '@/pages/MealBuilder'
import History from '@/pages/History'
import Analytics from '@/pages/Analytics'
import Settings from '@/pages/Settings'
import { initDB } from '@/lib/db'
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
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initDB()
      .then(() => setReady(true))
      .catch((error) => {
        console.error('Failed to initialize database', error)
        setReady(true)
      })
  }, [])

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><p className="text-sm text-slate-500">Loading...</p></div>
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

  useEffect(() => {
    if (settingsStore.settings) {
      const theme = settingsStore.settings.theme ?? 'light'
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.classList.toggle('dark', isDark)
    }
  }, [settingsStore.settings])

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    active: location.pathname === item.path,
    onClick: () => navigate(item.path),
  }))

  return (
    <AppShell
      header={
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 rounded-bl-2xl items-center justify-center bg-black text-2xl font-bold text-white">G</div>
          <div>
            <p className="text-xl font-medium uppercase tracking-tight text-black">GTrak</p>
            <h1 className="text-xs font-semibold text-slate-950">Growth Tracker for G's</h1>
          </div>
        </div>
      }
      bottomNavigation={<BottomNavigation items={navItems} />}
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
