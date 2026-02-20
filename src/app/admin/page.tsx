'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { FileText, Briefcase, Mail, Users, UserCheck, DollarSign, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    blogs: 0, 
    services: 0, 
    contacts: 0, 
    subscriptions: 0, 
    missions: 0,
    clients: 0,
    consultants: 0,
    revenue: 0,
    activeMissions: 0,
    pendingContacts: 0
  })

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(data => {
      setStats({ 
        blogs: data.blogs || 0,
        services: data.services || 0,
        contacts: data.contacts || 0,
        subscriptions: data.subscriptions || 0,
        missions: data.missions || 0,
        clients: data.clients || 0,
        consultants: data.consultants || 0,
        revenue: data.revenue || 0,
        activeMissions: data.activeMissions || 0,
        pendingContacts: data.pendingContacts || 0
      })
    }).catch(() => {})
  }, [])

  const mainCards = [
    { label: 'Total Clients', value: stats.clients, icon: Users, color: 'bg-blue-500', href: '/admin/users' },
    { label: 'Consultants', value: stats.consultants, icon: UserCheck, color: 'bg-green-500', href: '/admin/consultants' },
    { label: 'Active Subscriptions', value: stats.subscriptions, icon: TrendingUp, color: 'bg-purple-500', href: '/admin/subscriptions' },
    { label: 'Revenue (TND)', value: stats.revenue.toFixed(2), icon: DollarSign, color: 'bg-emerald-500', href: '/admin/subscriptions' },
  ]

  const activityCards = [
    { label: 'Total Missions', value: stats.missions, icon: Briefcase, color: 'bg-indigo-500', href: '/admin/missions' },
    { label: 'Active Missions', value: stats.activeMissions, icon: Activity, color: 'bg-orange-500', href: '/admin/missions' },
    { label: 'Pending Contacts', value: stats.pendingContacts, icon: Mail, color: 'bg-yellow-500', href: '/admin/contacts' },
    { label: 'Blog Posts', value: stats.blogs, icon: FileText, color: 'bg-pink-500', href: '/admin/blogs' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your consulting platform</p>
      </div>

      {/* Main Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainCards.map(card => {
            const Icon = card.icon
            return (
              <Link key={card.label} href={card.href}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">{card.label}</p>
                      <p className="text-3xl font-bold mt-2">{card.value}</p>
                    </div>
                    <div className={`${card.color} p-3 rounded-lg`}>
                      <Icon className="text-white" size={24} />
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Activity Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity & Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activityCards.map(card => {
            const Icon = card.icon
            return (
              <Link key={card.label} href={card.href}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">{card.label}</p>
                      <p className="text-3xl font-bold mt-2">{card.value}</p>
                    </div>
                    <div className={`${card.color} p-3 rounded-lg`}>
                      <Icon className="text-white" size={24} />
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/users" className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition">
            <h3 className="font-semibold text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-600 mt-1">View and manage all clients</p>
          </Link>
          <Link href="/admin/consultants" className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition">
            <h3 className="font-semibold text-gray-900">Manage Consultants</h3>
            <p className="text-sm text-gray-600 mt-1">Add or edit consultants</p>
          </Link>
          <Link href="/admin/subscription-plans" className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition">
            <h3 className="font-semibold text-gray-900">Subscription Plans</h3>
            <p className="text-sm text-gray-600 mt-1">Configure pricing plans</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
