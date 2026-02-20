'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Briefcase, Users, Calendar, Settings, LogOut } from 'lucide-react'

export default function ConsultantSidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/consultant', icon: Home, label: 'Dashboard' },
    { href: '/consultant/missions', icon: Briefcase, label: 'Missions' },
    { href: '/consultant/clients', icon: Users, label: 'Clients' },
    { href: '/consultant/schedule', icon: Calendar, label: 'Schedule' },
    { href: '/consultant/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">Consultant Portal</h2>
      </div>
      <nav className="px-4">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </Link>
          )
        })}
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-gray-600 hover:bg-gray-50 w-full transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  )
}
