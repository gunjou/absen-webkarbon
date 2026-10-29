import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, onTidakSah, setToken } from '@/lib/api'

const KUNCI = 'sesi'
const AuthContext = createContext(null)

// sesi: { token, user, pegawai }
function bacaSesi() {
  try {
    const sesi = JSON.parse(localStorage.getItem(KUNCI))
    if (!sesi?.token) return null
    setToken(sesi.token)
    return sesi
  } catch {
    return null
  }
}

function simpanSesi(sesi) {
  setToken(sesi?.token ?? null)
  try {
    if (sesi) localStorage.setItem(KUNCI, JSON.stringify(sesi))
    else localStorage.removeItem(KUNCI)
  } catch {
    /* abaikan */
  }
}

export function AuthProvider({ children }) {
  const [sesi, setSesi] = useState(bacaSesi)

  const login = useCallback(async ({ username, password }) => {
    const data = await api('/auth/login-absensi', { method: 'POST', body: { username, password } })
    const baru = { token: data.access_token, user: data.user, pegawai: data.pegawai }
    simpanSesi(baru)
    setSesi(baru)
    return baru
  }, [])

  const logout = useCallback(() => {
    simpanSesi(null)
    setSesi(null)
  }, [])

  // Token kedaluwarsa → kembali ke halaman login
  useEffect(() => onTidakSah(logout), [logout])

  const value = useMemo(
    () => ({
      pengguna: sesi && { ...sesi.user, ...sesi.pegawai, nama: sesi.pegawai?.nama ?? sesi.user?.nama },
      pegawai: sesi?.pegawai ?? null,
      login,
      logout,
    }),
    [sesi, login, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
