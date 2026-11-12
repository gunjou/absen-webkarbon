import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { api } from "@/lib/api";

const KUNCI = "sesi";
const AuthContext = createContext(null);

function bacaSesi() {
  try {
    return JSON.parse(localStorage.getItem(KUNCI));
  } catch {
    return null; // sesi rusak → anggap belum login
  }
}

// client "absensi" menandai login dari aplikasi absen pegawai (bukan panel admin)
async function loginApi({ username, password }) {
  const { access_token, refresh_token, user } = await api("/auth/login", {
    method: "POST",
    body: { username, password, client: "absensi" },
  });
  if (user.id_pegawai == null) throw new Error("Akun ini bukan akun pegawai.");
  return { token: access_token, refresh_token, user };
}

export function AuthProvider({ children }) {
  const [sesi, setSesi] = useState(bacaSesi);

  const login = useCallback(async (kredensial) => {
    const baru = await loginApi(kredensial);
    localStorage.setItem(KUNCI, JSON.stringify(baru));
    setSesi(baru);
    return baru;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KUNCI);
    setSesi(null);
  }, []);

  const value = useMemo(
    () => ({
      pengguna: sesi && { ...sesi.user, nama: sesi.user.full_name ?? sesi.user.username },
      login,
      logout,
    }),
    [sesi, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
