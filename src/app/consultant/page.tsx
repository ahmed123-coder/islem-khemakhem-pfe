'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  ChevronRight,
  ArrowUpRight,
  Plus,
  Settings,
  MoreVertical,
  Briefcase,
  Play,
  Award,
  CircleDashed,
  LayoutDashboard
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer 
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Mock Data
const clientGrowthData = [
  { name: 'W1', val: 10 },
  { name: 'W2', val: 15 },
  { name: 'W3', val: 12 },
  { name: 'W4', val: 24 },
]

export default function ConsultantWorkspace() {
  const [user, setUser] = React.useState<any>(null)
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [greeting, setGreeting] = React.useState('')

  React.useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/consultant/stats').then(r => r.json())
    ]).then(([userData, statsData]) => {
      setUser(userData)
      setStats(statsData)
    }).finally(() => setLoading(false))
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  if (loading) return null

  return (
    <div className="p-8 md:p-12 space-y-12">
      {/* Personalized Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Control Center
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            {greeting}, <span className="text-emerald-600 font-serif italic font-normal">{user?.name?.split(' ')[0] || 'Expert'}</span>.
          </h1>
          <p className="text-slate-500 font-bold mt-2 text-sm">
            You have <span className="text-emerald-700 italic">{stats?.appointmentsToday || 0} appointments</span> scheduled for today.
          </p>
        </div>
        <div className="flex gap-3">
           <Button className="h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black italic px-8 shadow-xl shadow-emerald-100 transition-all hover:scale-105 active:scale-95">
             <Plus className="w-4 h-4 mr-2" /> Open Calendar
           </Button>
           <Button variant="outline" className="h-12 rounded-2xl border-slate-200 bg-white/50 backdrop-blur-sm font-bold text-xs px-6">
             Update Availability
           </Button>
        </div>
      </section>

      {/* Bento Stats Grid */}
      <motion.section 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Large Card: Appointments */}
        <motion.div variants={item} className="md:col-span-2">
          <Card className="h-64 rounded-[40px] border-none bg-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-8 flex flex-col group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[100px] -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-150" />
             <div className="relative flex justify-between mb-auto">
               <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                  <Calendar className="w-6 h-6 text-white" />
               </div>
               <div className="text-right">
                 <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Upcoming Session</p>
                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-xs py-1 px-3">
                   {stats?.nextAppointment ? 'Scheduled' : 'None Today'}
                 </Badge>
               </div>
             </div>
             <div className="relative">
                <p className="text-2xl font-black text-slate-900 leading-tight mb-1">
                  {stats?.nextAppointment ? (
                    <>Session with <span className="text-emerald-600">{stats.nextAppointment.client.name}</span></>
                  ) : (
                    "No sessions remaining"
                  )}
                </p>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                   <Clock className="w-3.5 h-3.5" /> 
                   {stats?.nextAppointment 
                      ? new Date(stats.nextAppointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : '--:--'} • <span className="text-emerald-500 underline decoration-emerald-200">Video Call</span>
                </div>
             </div>
          </Card>
        </motion.div>

        {/* Circular Gauge: Hours Progress */}
        <motion.div variants={item}>
          <Card className="h-64 rounded-[40px] border-none bg-slate-900 text-white shadow-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="relative w-28 h-28 mb-4">
               {/* Simplified SVG Circular Gauge */}
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="50" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                  <circle cx="56" cy="56" r="50" fill="transparent" stroke="#10b981" strokeWidth="10" strokeDasharray="314" strokeDashoffset={314 - (314 * (stats?.progress || 0)) / 100} strokeLinecap="round" className="animate-pulse" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black">{stats?.progress || 0}%</span>
               </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1">Monthly Goal</p>
            <h4 className="text-sm font-bold">{stats?.hoursMonth || 0} / 160 Hours</h4>
          </Card>
        </motion.div>

        {/* Client Growth Sparkline */}
        <motion.div variants={item}>
          <Card className="h-64 rounded-[40px] border-none bg-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-8 flex flex-col">
            <div className="flex justify-between items-start mb-auto">
               <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600" />
               </div>
               <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] uppercase">
                 +{stats?.clientGrowth || 0} New
               </Badge>
            </div>
            <div className="h-16 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clientGrowthData}>
                   <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Portfolio Influence</p>
            <h4 className="text-2xl font-black text-slate-900">{stats?.totalClients || 0} <span className="text-slate-400 text-sm">Active Clients</span></h4>
          </Card>
        </motion.div>

        {/* Agenda View / Horizontal Feed */}
        <motion.div variants={item} className="lg:col-span-3">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Today's Missions</h3>
              <Link href="/consultant/appointments" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 hover:gap-3 transition-all">
                Full Agenda <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="space-y-4">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="group p-5 rounded-[32px] bg-white border border-slate-50 shadow-sm flex items-center gap-5 transition-all hover:shadow-xl hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center font-bold text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                       <span className="text-[10px] uppercase leading-none">{i === 1 ? 'Now' : '16:00'}</span>
                       <span className="text-xl leading-none">{i === 1 ? '•' : '12'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="font-bold text-slate-900 truncate">Quarterly Review</h4>
                       <p className="text-xs text-slate-400 font-medium truncate">Client: SARL Innovate — Project Alpha</p>
                    </div>
                    <Button size="icon" className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all">
                       <Play className="w-4 h-4 fill-current" />
                    </Button>
                 </div>
               ))}
            </div>
          </section>
        </motion.div>

        {/* Portfolio & Earnings Area */}
        <motion.div variants={item} className="lg:col-span-1">
           <Card className="h-full rounded-[40px] border-none bg-emerald-50 shadow-sm p-8 flex flex-col group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl" />
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6">
                 <Award className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Portfolio Quick-Look</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="aspect-square rounded-xl bg-white/60 p-1 flex items-center justify-center overflow-hidden border border-white">
                      <Zap className="w-4 h-4 text-emerald-300" />
                   </div>
                 ))}
              </div>
              <Button variant="ghost" className="mt-auto w-full rounded-xl bg-white/50 text-emerald-700 font-bold text-[10px] uppercase tracking-widest h-10">
                Update Case Studies
              </Button>
           </Card>
        </motion.div>
      </motion.section>

      {/* Empty State / Getting Started Checklist (Simulation for when data is low) */}
      <section className="bg-white/40 backdrop-blur-md rounded-[40px] border border-white/50 p-12 text-center max-w-4xl mx-auto">
         <div className="w-24 h-24 rounded-[32px] bg-white shadow-xl shadow-emerald-100 flex items-center justify-center mx-auto mb-8 relative">
            <Zap className="w-10 h-10 text-emerald-500 fill-emerald-500" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-black animate-bounce">!</div>
         </div>
         <h3 className="text-2xl font-serif italic text-slate-800 mb-4">You're just getting started, Expert.</h3>
         <p className="text-sm text-slate-500 font-medium mb-10 max-w-lg mx-auto leading-relaxed">
            Your workspace is active but you haven't finalized your profile yet. Complete these high-impact tasks to start attracting clients.
         </p>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-10">
            {[
              { label: 'Upload your professional certifications', done: true },
              { label: 'Define your service tiers & pricing', done: false },
              { label: 'Sync your Google/Outlook calendar', done: false },
              { label: 'Add 3 case studies to your portfolio', done: false },
            ].map((step, idx) => (
              <div key={idx} className={cn(
                "p-4 rounded-2xl flex items-center gap-3 transition-colors",
                step.done ? "bg-emerald-50/50" : "bg-white border border-slate-50"
              )}>
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center",
                  step.done ? "bg-emerald-500 text-white" : "border-2 border-slate-200"
                )}>
                   {step.done && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <span className={cn("text-xs font-bold", step.done ? "text-emerald-700 line-through opacity-50" : "text-slate-600")}>
                  {step.label}
                </span>
              </div>
            ))}
         </div>
         
         <Button className="rounded-2xl bg-slate-900 hover:bg-black text-white px-10 h-14 font-black italic shadow-2xl transition-all hover:scale-105 active:scale-95">
           Boost My Visibility Now <ArrowUpRight className="w-5 h-5 ml-3" />
         </Button>
      </section>
    </div>
  )
}
