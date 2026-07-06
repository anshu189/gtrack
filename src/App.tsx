import { useEffect, useState } from 'react'
import { AppShell } from '@/components/ui/app-shell'
import { BottomNavigation } from '@/components/ui/bottom-navigation'
import Dashboard from '@/pages/Dashboard'
import { initDB } from '@/lib/db'
import { BarChart3, Home, Settings2 } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: Home, active: true },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Settings', icon: Settings2 },
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

  return (
    <AppShell
      header={
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-slate-500">GTrak</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Growth Tracker</h1>
        </div>
      }
      bottomNavigation={<BottomNavigation items={navItems} />}
    >
      {ready ? <Dashboard /> : <div className="p-6 text-sm text-slate-500">Loading...</div>}
    </AppShell>
  )
}

export default App
