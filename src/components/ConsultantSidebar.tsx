'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Briefcase, Users, Calendar, Settings, LogOut } from 'lucide-react'

export default function ConsultantSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const links = [
    { href: '/consultant', icon: Home, label: 'Dashboard' },
    { href: '/consultant/missions', icon: Briefcase, label: 'Missions' },
    { href: '/consultant/clients', icon: Users, label: 'Clients' },
    { href: '/consultant/schedule', icon: Calendar, label: 'Schedule' },
    { href: '/consultant/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen shadow-lg">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Consultant Portal</h2>
        <p className="text-xs text-gray-500 mt-1">Manage your clients</p>
      </div>
      <nav className="px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-600 hover:bg-gray-50 hover:translate-x-1'
              }`}
            >
              <Icon size={20} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
              <span className="font-medium">{link.label}</span>
            </Link>
          )
        })}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 w-full transition-all duration-200 group hover:translate-x-1"
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </aside>
  )
}
