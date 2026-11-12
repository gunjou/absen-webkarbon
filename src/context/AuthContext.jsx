import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, bacaSesi, EVENT_SESI_HABIS, KUNCI_SESI as KUNCI } from "@/lib/api";
import { toast } from "sonner";

const AuthContext = createContext(null);

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

  // api.js menghapus sesi saat token tak bisa diperbarui → ikut keluar
  useEffect(() => {
    const habis = () => {
      setSesi(null);
      toast.error("Sesi berakhir, silakan masuk lagi.", { id: "sesi-habis" });
    };
    window.addEventListener(EVENT_SESI_HABIS, habis);
    return () => window.removeEventListener(EVENT_SESI_HABIS, habis);
  }, []);

  // Saat app dibuka, segarkan data akun (role/permission bisa berubah oleh admin)
  const adaSesi = !!sesi;
  useEffect(() => {
    if (!adaSesi) return;
    api("/auth/me")
      .then((user) => {
        const kini = bacaSesi();
        if (!kini || !user) return;
        const baru = { ...kini, user: { ...kini.user, ...user } };
        localStorage.setItem(KUNCI, JSON.stringify(baru));
        setSesi(baru);
      })
      .catch(() => {}); // offline/error: tetap pakai data sesi tersimpan
  }, [adaSesi]);

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

  // Konfirmasi lewat toast; setelah logout WajibLogin mengarahkan ke /login
  const konfirmasiKeluar = useCallback(
    () =>
      toast("Keluar dari akun?", {
        id: "konfirmasi-keluar",
        action: { label: "Ya, keluar", onClick: logout },
        cancel: { label: "Tidak", onClick: () => {} },
      }),
    [logout],
  );

  const value = useMemo(
    () => ({
      pengguna: sesi && { ...sesi.user, nama: sesi.user.full_name ?? sesi.user.username },
      login,
      logout,
      konfirmasiKeluar,
    }),
    [sesi, login, logout, konfirmasiKeluar],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
