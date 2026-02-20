'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Briefcase, Mail, Settings, ChevronDown, Package, CreditCard, Users, UserCheck, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [subscriptionOpen, setSubscriptionOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const links = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/users', label: 'Users (Clients)', icon: Users },
    { href: '/admin/consultants', label: 'Consultants', icon: UserCheck },
    { href: '/admin/missions', label: 'Missions', icon: Briefcase },
    { href: '/admin/content', label: 'Content Editor', icon: Settings },
    { href: '/admin/blogs', label: 'Blogs', icon: FileText },
    { href: '/admin/services', label: 'Services', icon: Briefcase },
    { href: '/admin/contacts', label: 'Contacts', icon: Mail },
  ]

  const subscriptionLinks = [
    { href: '/admin/subscription-plans', label: 'Plans', icon: Package },
    { href: '/admin/subscription-packages', label: 'Packages', icon: CreditCard },
    { href: '/admin/subscriptions', label: 'Subscriptions', icon: Users },
  ]

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-xl">
      <div className="p-6 border-b border-gray-700/50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Admin Panel</h1>
        <p className="text-xs text-gray-400 mt-1">SaaS Management</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
        {links.map(link => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30' : 'hover:bg-gray-700/50 hover:translate-x-1'
              }`}
            >
              <Icon size={20} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
              <span className="font-medium">{link.label}</span>
            </Link>
          )
        })}

        <div>
          <button
            onClick={() => setSubscriptionOpen(!subscriptionOpen)}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group hover:translate-x-1"
          >
            <div className="flex items-center gap-3">
              <Package size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">Subscriptions</span>
            </div>
            <ChevronDown size={16} className={`transition-transform duration-300 ${subscriptionOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${subscriptionOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            {subscriptionLinks.map(link => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-200 group ${
                    isActive ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-md' : 'hover:bg-gray-700/50 hover:translate-x-1'
                  }`}
                >
                  <Icon size={16} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-700/50 space-y-1">
        <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group hover:translate-x-1">
          <Home size={16} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm">Back to Site</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 w-full text-left group hover:translate-x-1"
        >
          <LogOut size={16} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  )
}
