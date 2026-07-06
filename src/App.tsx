import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AppShell } from '@/components/ui/app-shell'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import Dashboard from '@/pages/Dashboard'
import MealBuilder from '@/pages/MealBuilder'
import NutritionTracker from '@/pages/NutritionTracker'
import History from '@/pages/History'
import Analytics from '@/pages/Analytics'
import Settings from '@/pages/Settings'
import { initDB } from '@/lib/db'
import { useSettingsStore } from '@/stores/settingsStore'
import { BarChart3, Clock, Home, UtensilsCrossed, Apple, Menu } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: Home, path: '/' },
  { label: 'Meals', icon: UtensilsCrossed, path: '/meals' },
  { label: 'Nutrition', icon: Apple, path: '/nutrition' },
  { label: 'History', icon: Clock, path: '/history' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
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
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">G</div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-blue-600">GTrak</p>
              <h1 className="text-base font-semibold text-slate-950">Growth Tracker</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            aria-label="Settings"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      }
      bottomNavigation={<BottomNavigation items={navItems} />}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/meals" element={<MealBuilder />} />
        <Route path="/nutrition" element={<NutritionTracker />} />
        <Route path="/history" element={<History />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AppShell>
  )
}

export default App
