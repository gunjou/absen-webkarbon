import {
  CalendarCheck,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  MapPin,
  Settings,
  UserCog,
  Users,
} from 'lucide-react'

// Kunci `izin` disiapkan untuk lib/roles.js (hak akses) nanti
export const NAV_GROUPS = [
  {
    label: 'Utama',
    items: [{ to: '/', label: 'Dasbor', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Absensi',
    items: [
      { to: '/absensi', label: 'Monitor harian', icon: CalendarCheck, izin: 'absensi.lihat' },
      { to: '/absensi/riwayat', label: 'Riwayat', icon: ClipboardList, izin: 'absensi.lihat' },
      { to: '/absensi/rekap', label: 'Rekap', icon: FileBarChart, izin: 'absensi.rekap' },
    ],
  },
  {
    label: 'Data',
    items: [{ to: '/pegawai', label: 'Pegawai', icon: Users, izin: 'pegawai.lihat' }],
  },
  {
    label: 'Sistem',
    items: [
      { to: '/pengguna', label: 'Pengguna', icon: UserCog, izin: 'pengguna.lihat' },
      { to: '/lokasi-absen', label: 'Lokasi absen', icon: MapPin, izin: 'lokasi.lihat' },
      { to: '/pengaturan', label: 'Pengaturan', icon: Settings, izin: 'pengaturan.lihat' },
    ],
  },
]
