const BASE_URL = import.meta.env.VITE_API_URL;
export const KUNCI_SESI = "sesi";
export const EVENT_SESI_HABIS = "sesi-habis";

export function bacaSesi() {
  try {
    return JSON.parse(localStorage.getItem(KUNCI_SESI));
  } catch {
    return null; // sesi rusak → anggap belum login
  }
}

function sesiHabis() {
  localStorage.removeItem(KUNCI_SESI);
  window.dispatchEvent(new Event(EVENT_SESI_HABIS));
}

async function kirim(path, { method, body }) {
  const sesi = bacaSesi();
  const form = body instanceof FormData;
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(body && !form && { "Content-Type": "application/json" }),
        ...(sesi?.token && { Authorization: `Bearer ${sesi.token}` }),
      },
      body: body && (form ? body : JSON.stringify(body)),
    });
  } catch {
    throw new Error(
      "Tidak dapat terhubung ke server. Periksa koneksi internet.",
    );
  }
  const isJson = res.headers.get("content-type")?.includes("json");
  const json = isJson ? await res.json().catch(() => null) : null;
  return { res, json };
}

let refreshBerjalan = null;

// satu refresh untuk semua request yang kedaluwarsa bersamaan
function refreshToken() {
  refreshBerjalan ??= (async () => {
    const sesi = bacaSesi();
    const { res, json } = await kirim("/auth/refresh", {
      method: "POST",
      body: { refresh_token: sesi?.refresh_token },
    });
    if (!res.ok || !json?.data?.access_token) return false;
    localStorage.setItem(
      KUNCI_SESI,
      JSON.stringify({ ...sesi, token: json.data.access_token }),
    );
    return true;
  })().finally(() => {
    refreshBerjalan = null;
  });
  return refreshBerjalan;
}

/**
 * Panggil API backend. Token sesi dipasang otomatis; `TOKEN_EXPIRED` → refresh lalu ulangi sekali.
 * `body` boleh objek (JSON) atau FormData (multipart).
 * Sukses → isi `data` dari envelope (respons non-JSON mis. foto → Blob); gagal → Error berisi `message` dari server dan `code`.
 */
export async function api(path, { method = "GET", body } = {}) {
  let { res, json } = await kirim(path, { method, body });

  if (res.status === 401 && json?.code === "TOKEN_EXPIRED") {
    if (await refreshToken().catch(() => false)) {
      ({ res, json } = await kirim(path, { method, body }));
    } else {
      sesiHabis();
    }
  } else if (
    res.status === 401 &&
    ["TOKEN_MISSING", "INVALID_TOKEN"].includes(json?.code) &&
    bacaSesi()
  ) {
    sesiHabis();
  }

  if (!res.ok) {
    throw Object.assign(
      new Error(json?.message ?? `Terjadi kesalahan (${res.status})`),
      { code: json?.code, status: res.status },
    );
  }
  return json ? json.data : res.blob();
}
