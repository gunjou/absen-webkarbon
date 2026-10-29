const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(pesan, { status, kode, data } = {}) {
    super(pesan)
    this.status = status
    this.kode = kode
    this.data = data
  }
}

let token = null
let saatTidakSah = null

export function setToken(nilai) {
  token = nilai
}

/** Dipanggil saat API membalas 401 (token kedaluwarsa/tidak sah). */
export function onTidakSah(fn) {
  saatTidakSah = fn
}

/** URL aset dari API, mis. "/api/pegawai/2/foto" → "http://localhost:5001/api/pegawai/2/foto" */
export function urlAset(path) {
  if (!path || /^https?:\/\//.test(path)) return path
  return new URL(path, BASE_URL).toString()
}

export async function api(path, { method = 'GET', body, headers, ...opsi } = {}) {
  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...opsi,
    })
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.', { kode: 'JARINGAN' })
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    // Format galat bisa { error: { code, message } } atau { code, message }
    const galat = data?.error ?? data ?? {}
    const kode = galat.code ?? galat.kode
    const pesan = galat.message ?? galat.pesan ?? `Terjadi kesalahan (${res.status})`
    if (res.status === 401 && token) saatTidakSah?.()
    throw new ApiError(pesan, { status: res.status, kode, data })
  }

  return data?.data ?? data
}
