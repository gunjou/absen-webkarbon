import { Construction } from 'lucide-react'
import { Card, EmptyState, PageHeader } from '@/components/ui'

export default function Segera({ title }) {
  return (
    <>
      <PageHeader title={title} />
      <Card>
        <EmptyState
          icon={Construction}
          title="Halaman sedang disiapkan"
          description="Fitur ini belum tersedia. Silakan kembali lagi nanti."
        />
      </Card>
    </>
  )
}
