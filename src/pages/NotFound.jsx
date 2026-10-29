import { Compass } from 'lucide-react'
import { Button, Card, EmptyState } from '@/components/ui'

export default function NotFound() {
  return (
    <Card>
      <EmptyState
        icon={Compass}
        title="Halaman tidak ditemukan"
        description="Alamat yang Anda buka tidak tersedia."
        action={<Button to="/">Kembali ke dasbor</Button>}
      />
    </Card>
  )
}
