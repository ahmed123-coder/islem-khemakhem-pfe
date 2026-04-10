'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Briefcase, Mail, Settings, Users, UserCheck, LogOut, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const links = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/users', label: 'Users (Clients)', icon: Users },
    { href: '/admin/consultants', label: 'Consultants', icon: UserCheck },
    { href: '/admin/subscriptions', label: 'Subscriptions', icon: ShoppingCart },
    { href: '/admin/content', label: 'Content Editor', icon: Settings },
    { href: '/admin/blogs', label: 'Blogs', icon: FileText },
    { href: '/admin/services', label: 'Services', icon: Briefcase },
    { href: '/admin/contacts', label: 'Contacts', icon: Mail },
  ]

  return (
    <aside className="w-[90px] md:w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-xl transition-all duration-300">
      <div className="p-4 md:p-6 border-b border-gray-700/50 flex items-center justify-center md:justify-start">
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Admin Panel</h1>
          <p className="text-xs text-gray-400 mt-1">SaaS Management</p>
        </div>
        <span className="md:hidden text-blue-400 font-bold text-xs text-center">AP</span>
      </div>

      <nav className="flex-1 p-2 md:p-4 space-y-1 overflow-y-auto scrollbar-hide">
        {links.map(link => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              className={`flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30' : 'hover:bg-gray-700/50 md:hover:translate-x-1'
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
