import { Toaster } from 'sonner'
import { useTheme } from '@/context/ThemeContext'

// Toast mengikuti tema aktif
export function TemaToaster() {
  const { theme } = useTheme()
  return <Toaster theme={theme} position="top-center" richColors closeButton />
}
