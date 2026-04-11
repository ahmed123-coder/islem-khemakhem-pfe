'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  UserSquare2, 
  Briefcase, 
  Mail, 
  TrendingUp, 
  ArrowUpRight,
  Plus,
  FileEdit,
  Globe,
  Zap,
  LayoutDashboard,
  ChevronRight
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Mock Data for the chart
const chartData = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 600 },
  { name: 'Thu', value: 800 },
  { name: 'Fri', value: 500 },
  { name: 'Sat', value: 900 },
  { name: 'Sun', value: 1100 },
]

export default function AdminDashboard() {
  const [stats, setStats] = React.useState({ 
    blogs: 0, 
    services: 0, 
    contacts: 0,
    clients: 0,
    consultants: 0,
    pendingContacts: 0
  })

  React.useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        setStats({ 
          blogs: data.blogs || 0,
          services: data.services || 0,
          contacts: data.contacts || 0,
          clients: data.clients || 0,
          consultants: data.consultants || 0,
          pendingContacts: data.pendingContacts || 0
        })
      })
      .catch(() => {})
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <div className="space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
        <Link href="/admin" className="hover:text-blue-600 transition-colors">Root</Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-blue-600">Dashboard</span>
      </nav>

      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">
            <LayoutDashboard className="w-3 h-3" />
            Control Center
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 font-medium">Welcome back, here's what's happening with DSL Consulting today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200 bg-white/50 backdrop-blur-sm font-bold text-xs px-5">
            View Analytics
          </Button>
          <Button className="rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 font-bold text-xs px-5">
            Download Report
          </Button>
        </div>
      </section>

      {/* Bento Grid Stats */}
      <motion.section 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Large Card: Clients */}
        <motion.div variants={item} className="md:col-span-2 lg:col-span-2">
          <Card className="relative overflow-hidden h-64 rounded-[32px] border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-125" />
            <div className="relative p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-auto">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                  <TrendingUp className="w-3 h-3" />
                  +12.5% Grow
                </div>
              </div>
              <div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mb-1">Total Active Clients</p>
                <div className="flex items-baseline gap-4">
                  <h3 className="text-5xl font-black text-slate-900 leading-none">{stats.clients}</h3>
                  <div className="h-24 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#2563eb" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Small Card: Consultants */}
        <motion.div variants={item}>
          <Card className="h-64 rounded-[32px] border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 flex flex-col group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6 transition-transform group-hover:rotate-12">
              <UserSquare2 className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mb-2">Team Size</p>
            <h3 className="text-4xl font-black text-slate-900 italic mb-auto">{stats.consultants}</h3>
            <Link href="/admin/consultants" className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:gap-3 transition-all">
              Manage Experts <ArrowUpRight className="w-3 h-3" />
            </Link>
          </Card>
        </motion.div>

        {/* Small Card: Services */}
        <motion.div variants={item}>
          <Card className="h-64 rounded-[32px] border-none bg-slate-900 text-white shadow-2xl p-8 flex flex-col group relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
              <Briefcase className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">Offerings</p>
            <h3 className="text-4xl font-black italic mb-auto">{stats.services}</h3>
            <Link href="/admin/services" className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:gap-3 transition-all relative z-10">
              Active Services <ArrowUpRight className="w-3 h-3" />
            </Link>
          </Card>
        </motion.div>

        {/* Medium Card: Contacts Chart */}
        <motion.div variants={item} className="md:col-span-2">
          <Card className="rounded-[32px] border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 group">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mb-1">Inquiries Received</p>
                <h3 className="text-3xl font-black text-slate-900">{stats.contacts}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <Area 
                    type="step" 
                    dataKey="value" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    fillOpacity={0.1} 
                    fill="#f97316" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Interactive Quick Actions */}
        <motion.div variants={item} className="md:col-span-2">
          <div className="grid grid-cols-2 gap-4 h-full">
            <Link href="/admin/blogs" className="group">
              <div className="h-full rounded-[32px] bg-white border border-slate-100 p-6 flex items-center gap-4 transition-all hover:bg-slate-50 hover:shadow-lg active:scale-95">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileEdit className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Write Blog</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Content Engine</p>
                </div>
              </div>
            </Link>
            <Link href="/admin/content" className="group">
              <div className="h-full rounded-[32px] bg-white border border-slate-100 p-6 flex items-center gap-4 transition-all hover:bg-slate-50 hover:shadow-lg active:scale-95">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Edit Site</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live Visuals</p>
                </div>
              </div>
            </Link>
            <div className="col-span-2">
              <Button className="w-full h-16 rounded-[24px] bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 text-white font-black italic tracking-tight gap-3 text-lg transition-all hover:-translate-y-1">
                <Zap className="w-6 h-6 fill-white" />
                System Boost Now <Plus className="w-4 h-4 ml-auto" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.section>

    </div>
  )
}
