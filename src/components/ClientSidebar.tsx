'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, FileText, MessageSquare, Settings, LogOut } from 'lucide-react'

export default function ClientSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const links = [
    { href: '/client', icon: Home, label: 'Dashboard' },
    { href: '/client/missions', icon: FileText, label: 'My Missions' },
    { href: '/client/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/client/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen shadow-lg">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Client Portal</h2>
        <p className="text-xs text-gray-500 mt-1">Manage your missions</p>
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
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
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
