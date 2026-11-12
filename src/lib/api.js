const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Panggil API backend. Sukses → isi `data` dari envelope; gagal → Error berisi `message`
 * dari server (sudah Bahasa Indonesia) dan `code` untuk logika.
 */
export async function api(path, { method = "GET", body, token } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(body && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body && JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Tidak dapat terhubung ke server. Periksa koneksi internet.",
    );
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw Object.assign(
      new Error(json?.message ?? `Terjadi kesalahan (${res.status})`),
      {
        code: json?.code,
      },
    );
  }
  return json?.data;
}
