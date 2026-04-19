'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Save, Key, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function AdminProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setFormData(prev => ({ ...prev, name: data.name || '', email: data.email || '' }))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match')
        return
      }
      if (!formData.currentPassword) {
        setError('Current password is required to set a new password')
        return
      }
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      toast.success('Profile updated successfully')
      
      // Clear password fields on success
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
      router.refresh()
      
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">My Profile</h1>
        <p className="text-slate-500 font-medium">Manage your administrator account details and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Info & Avatar (Decorative) */}
        <div className="md:col-span-1 space-y-6">
          <Card className="rounded-[32px] border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-blue-200 mb-6 relative group overflow-hidden">
               <span className="text-white text-3xl font-black">
                 {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'AD'}
               </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">{formData.name || 'Administrator'}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Super User</p>
            <div className="w-full h-px bg-slate-100 my-2"></div>
            <p className="text-sm text-slate-500 flex items-center justify-center gap-2 mt-4">
              <Shield className="w-4 h-4 text-emerald-500" />
              Full Access Granted
            </p>
          </Card>
        </div>

        {/* Right Column - Form */}
        <div className="md:col-span-2">
          <Card className="rounded-[32px] border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-300" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-300" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                        placeholder="admin@dsl.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100 my-8"></div>

                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Key className="w-5 h-5 text-orange-500" />
                  Security (Optional)
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                      placeholder="Leave blank to keep current"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                        placeholder="New password"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="w-full md:w-auto rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 font-bold px-8 py-6 h-auto transition-all"
                  >
                    {saving ? 'Saving Changes...' : (
                      <span className="flex items-center gap-2">
                        <Save className="w-5 h-5" /> Save Profile
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
