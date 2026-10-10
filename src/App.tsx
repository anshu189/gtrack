import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AppShell, ScrollToTop, TabBar, type TabItem } from '@/components/ds'
import Dashboard from '@/pages/Dashboard'
import MealBuilder from '@/pages/MealBuilder'
import History from '@/pages/History'
import Analytics from '@/pages/Analytics'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import Onboarding from '@/pages/Onboarding'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { isProfileComplete } from '@/lib/utils/profile'

/**
 * Tab labels are short nouns so five cells fit the DS pill at phone width;
 * the screens keep their fuller headings.
 */
const NAV_ITEMS: (Omit<TabItem, 'active' | 'onClick'> & { path: string })[] = [
  { label: 'Home', icon: 'home', activeIcon: 'home-fill', path: '/' },
  { label: 'Meals', icon: 'utensils', path: '/meals' },
  { label: 'History', icon: 'clock', path: '/history' },
  { label: 'Stats', icon: 'progress', path: '/analytics' },
  { label: 'Settings', icon: 'settings', path: '/settings' },
]

const Loading = () => (
  <div className="flex min-h-screen items-center justify-center bg-canvas">
    <p className="body-text text-ink-2">Loading…</p>
  </div>
)

function App() {
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)
  const init = useAuthStore((s) => s.init)

  useEffect(() => init(), [init])

  if (!initialized) return <Loading />
  if (!user) return <Login />

  return <SignedIn />
}

/**
 * Gate between the sign-up questions and the app proper. Settings carry the
 * profile, so they have to be in hand before the choice can be made — but a
 * settings read that fails must never lock someone out of their own data, so
 * an error falls through to the app.
 */
function SignedIn() {
  const settings = useSettingsStore((s) => s.settings)
  const error = useSettingsStore((s) => s.error)
  const load = useSettingsStore((s) => s.load)

  useEffect(() => {
    load()
  }, [load])

  if (!settings) return error ? <AppLayout /> : <Loading />
  if (!isProfileComplete(settings.profile)) return <Onboarding />

  return <AppLayout />
}

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  // Each tab opens at its top. Without this a tab kept the previous
  // screen's scroll position and could open halfway down.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  const navItems: TabItem[] = NAV_ITEMS.map((item) => ({
    label: item.label,
    icon: item.icon,
    activeIcon: item.activeIcon,
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
      tabBar={
        <>
          <ScrollToTop />
          <TabBar items={navItems} />
        </>
      }
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
