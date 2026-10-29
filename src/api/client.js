import createClient from "openapi-fetch";

/** @type {import("openapi-fetch").Client<import("./schema").paths>} */
export const api = createClient({ baseUrl: import.meta.env.VITE_API_URL ?? "/api" });

api.use({
  onRequest({ request }) {
    // Token disimpan AuthContext di dalam sesi { token, user, pegawai }
    let token = null;
    try {
      token = JSON.parse(localStorage.getItem("sesi"))?.token;
    } catch {
      /* sesi rusak → tanpa token */
    }
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  },
});

// GET lalu buka envelope { data: { data } }; galat API → Error dengan pesan dari server
export async function ambil(path, init) {
  const { data, error } = await api.GET(path, init);
  if (error) throw new Error(error?.error?.message ?? "Gagal memuat data");
  return data.data;
}
