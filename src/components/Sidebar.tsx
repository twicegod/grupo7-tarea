'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import {
  Stethoscope,
  LayoutDashboard,
  CalendarPlus,
  Users,
  LogOut,
  LogIn,
} from 'lucide-react'

const navItems = [
  { href: '/',          label: 'Médicos',    icon: Users },
  { href: '/dashboard', label: 'Mis Citas',  icon: LayoutDashboard },
]

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="bg-teal-600 text-white p-1.5 rounded-lg">
            <Stethoscope size={18} />
          </div>
          <span className="font-bold text-gray-800 text-base">ConsultorioMed</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-teal-50 text-teal-700 border-l-[3px] border-teal-600 pl-[9px]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User / Login */}
      <div className="px-3 py-4 border-t border-gray-100">
        {user ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 px-3 truncate">{user.email}</p>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut size={17} />
              Cerrar sesión
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 transition-all"
          >
            <LogIn size={17} />
            Ingresar
          </Link>
        )}
      </div>
    </aside>
  )
}
