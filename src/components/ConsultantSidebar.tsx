'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Settings, LogOut, Users, Calendar, Briefcase } from 'lucide-react'

export default function ConsultantSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const links = [
    { href: '/consultant', label: 'Dashboard', icon: Home },
    { href: '/consultant/clients', label: 'Clients', icon: Users },
    { href: '/consultant/reservations', label: 'Reservations', icon: Calendar },
    { href: '/consultant/portfolio', label: 'Portfolio', icon: Briefcase },
    { href: '/consultant/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside className="w-[90px] md:w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-xl transition-all duration-300">
      <div className="p-4 md:p-6 border-b border-gray-700/50 flex items-center justify-center md:justify-start">
        <h1 className="hidden md:block text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Consultant Portal</h1>
        <span className="md:hidden text-green-400 font-bold text-xs text-center">CP</span>
      </div>

      <nav className="flex-1 p-2 md:p-4 space-y-1">
        {links.map(link => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              className={`flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-500/30' : 'hover:bg-gray-700/50 md:hover:translate-x-1'
              }`}
            >
              <Icon size={20} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
              <span className="hidden md:block font-medium">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-2 md:p-4 border-t border-gray-700/50 space-y-1">
        <Link href="/" title="Back to Site" className="flex items-center justify-center md:justify-start gap-2 px-2 md:px-4 py-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group md:hover:translate-x-1">
          <Home size={16} className="group-hover:scale-110 transition-transform" />
          <span className="hidden md:block text-sm">Back to Site</span>
        </Link>
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex items-center justify-center md:justify-start gap-2 px-2 md:px-4 py-2 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 w-full text-left group md:hover:translate-x-1"
        >
          <LogOut size={16} className="group-hover:scale-110 transition-transform" />
          <span className="hidden md:block text-sm">Logout</span>
        </button>
      </div>
    </aside>
  )
}
