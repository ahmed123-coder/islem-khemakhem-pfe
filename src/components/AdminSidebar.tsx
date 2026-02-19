'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Briefcase, Mail, Settings, ChevronDown, Package, CreditCard, Users } from 'lucide-react'
import { useState } from 'react'

export default function AdminSidebar() {
  const pathname = usePathname()
  const [subscriptionOpen, setSubscriptionOpen] = useState(false)

  const links = [
    { href: '/admin', label: 'Dashboard', icon: Home },
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
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {links.map(link => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </Link>
          )
        })}

        <div>
          <button
            onClick={() => setSubscriptionOpen(!subscriptionOpen)}
            className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            <div className="flex items-center gap-3">
              <Package size={20} />
              <span>Subscriptions</span>
            </div>
            <ChevronDown size={16} className={`transition ${subscriptionOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {subscriptionOpen && (
            <div className="ml-4 mt-2 space-y-1">
              {subscriptionLinks.map(link => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${
                      isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition">
          <Home size={16} />
          <span className="text-sm">Back to Site</span>
        </Link>
      </div>
    </aside>
  )
}
