import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

function bacaCiut() {
  try {
    return localStorage.getItem('sidebar-ciut') === '1'
  } catch {
    return false
  }
}

export function AppLayout() {
  const [ciut, setCiut] = useState(bacaCiut)
  const [mobileOpen, setMobileOpen] = useState(false)
  const tutupMobile = useCallback(() => setMobileOpen(false), [])

  const toggleCiut = () =>
    setCiut((v) => {
      try {
        localStorage.setItem('sidebar-ciut', v ? '0' : '1')
      } catch {
        /* abaikan */
      }
      return !v
    })

  // TODO: ganti dengan data dari AuthContext
  const pengguna = { nama: 'Admin Desa', peran: 'Administrator' }

  return (
    <div className="min-h-dvh bg-bg">
      <Topbar ciut={ciut} onToggleCiut={toggleCiut} onOpenMobile={() => setMobileOpen(true)} pengguna={pengguna} />
      <div className="flex">
        <Sidebar ciut={ciut} mobileOpen={mobileOpen} onCloseMobile={tutupMobile} />
        <main className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
