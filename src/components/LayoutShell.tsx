'use client'

import { usePathname } from 'next/navigation'

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login'
  return (
    <main className={`flex-1 ${isAuthPage ? '' : 'ml-60'}`}>
      {children}
    </main>
  )
}
