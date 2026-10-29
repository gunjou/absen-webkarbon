import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const KUNCI = 'tema'
const ThemeContext = createContext(null)

function bacaPilihan() {
  try {
    const t = localStorage.getItem(KUNCI)
    return t === 'light' || t === 'dark' ? t : 'system'
  } catch {
    return 'system'
  }
}

const mediaGelap = () => window.matchMedia('(prefers-color-scheme: dark)')

export function ThemeProvider({ children }) {
  // pilihan: 'light' | 'dark' | 'system'
  const [pilihan, setPilihanState] = useState(bacaPilihan)
  const [sistemGelap, setSistemGelap] = useState(() => mediaGelap().matches)

  useEffect(() => {
    const mq = mediaGelap()
    const ubah = (e) => setSistemGelap(e.matches)
    mq.addEventListener('change', ubah)
    return () => mq.removeEventListener('change', ubah)
  }, [])

  const theme = pilihan === 'system' ? (sistemGelap ? 'dark' : 'light') : pilihan

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const setPilihan = useCallback((nilai) => {
    setPilihanState(nilai)
    try {
      localStorage.setItem(KUNCI, nilai)
    } catch {
      /* abaikan */
    }
  }, [])

  const value = useMemo(() => ({ pilihan, setPilihan, theme }), [pilihan, setPilihan, theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme harus dipakai di dalam ThemeProvider')
  return ctx
}
