'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ConsultantPortfolio() {
  const t = useTranslations("consultantPage.portfolio")
  const [consultant, setConsultant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    hourlyRate: '',
    bio: '',
    imageUrl: ''
  })

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/consultant/portfolio')
      const result = await res.json()
      const data = result.data || result
      setConsultant(data)
      setFormData({
        name: data.name || '',
        specialty: data.specialty || '',
        hourlyRate: data.hourlyRate || '',
        bio: data.bio || '',
        imageUrl: data.imageUrl || ''
      })
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      await fetch('/api/consultant/portfolio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      setEditing(false)
      fetchPortfolio()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">{t("loading")}</div>

  const stats = {
    totalClients: consultant?.orders?.length || 0,
    activeMissions: consultant?.missions?.filter((m: any) => m.status === 'IN_PROGRESS').length || 0,
    completedMissions: consultant?.missions?.filter((m: any) => m.status === 'COMPLETED').length || 0,
    totalReservations: consultant?.reservations?.length || 0
  }

  return (
    <div className="p-8 md:p-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-900">{t("title")}</h1>
          <Button
            onClick={() => editing ? handleUpdate() : setEditing(true)}
            className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black text-xs uppercase tracking-widest px-6"
          >
            {editing ? t("saveChanges") : t("editProfile")}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="rounded-[2rem] border border-slate-100 shadow-xl p-6">
              <div className="text-center">
                {editing ? (
                  <Input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder={t("imageUrl")}
                    className="rounded-xl h-10 mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 bg-slate-100 rounded-[2rem] mx-auto mb-4 flex items-center justify-center overflow-hidden">
                    {consultant?.imageUrl ? (
                      <Avatar className="w-full h-full">
                        <AvatarImage src={consultant.imageUrl} alt={consultant.name} className="object-cover" />
                        <AvatarFallback className="text-3xl">👤</AvatarFallback>
                      </Avatar>
                    ) : (
                      <span className="text-4xl">👤</span>
                    )}
                  </div>
                )}
                
                {editing ? (
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-xl h-10 mb-2 text-center font-semibold"
                  />
                ) : (
                  <h2 className="text-2xl font-black text-slate-900 mb-2">{consultant?.name}</h2>
                )}

                {editing ? (
                  <Input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder={t("specialty")}
                    className="rounded-xl h-10 mb-2 text-center"
                  />
                ) : (
                  <p className="text-slate-500 font-medium mb-4">{consultant?.specialty || t("noSpecialty")}</p>
                )}

                <div className="border-t border-slate-100 pt-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400 font-bold text-xs uppercase">{t("email")}:</span>
                    <span className="font-black text-slate-900">{consultant?.email}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400 font-bold text-xs uppercase">{t("hourlyRate")}:</span>
                    {editing ? (
                      <Input
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                        className="w-20 h-8 rounded-lg text-right text-sm"
                      />
                    ) : (
                      <span className="font-black text-slate-900">${consultant?.hourlyRate || 0}/hr</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold text-xs uppercase">{t("status")}:</span>
                    <Badge className={consultant?.isActive ? "bg-emerald-100 text-emerald-700 border-none" : "bg-slate-100 text-slate-500 border-none"}>
                      {consultant?.isActive ? t("active") : t("inactive")}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl border-none shadow-lg p-4 text-center">
                <div className="text-3xl font-black text-blue-600">{stats.totalClients}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t("totalClients")}</div>
              </Card>
              <Card className="rounded-2xl border-none shadow-lg p-4 text-center">
                <div className="text-3xl font-black text-emerald-600">{stats.activeMissions}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t("activeMissions")}</div>
              </Card>
              <Card className="rounded-2xl border-none shadow-lg p-4 text-center">
                <div className="text-3xl font-black text-purple-600">{stats.completedMissions}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t("completed")}</div>
              </Card>
              <Card className="rounded-2xl border-none shadow-lg p-4 text-center">
                <div className="text-3xl font-black text-orange-600">{stats.totalReservations}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t("reservations")}</div>
              </Card>
            </div>

            <Card className="rounded-[2rem] border-none shadow-xl p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4">{t("aboutMe")}</h3>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder={t("writeBio")}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 h-32 font-medium"
                />
              ) : (
                <p className="text-slate-500 font-medium">{consultant?.bio || t("noBio")}</p>
              )}
            </Card>

            <Card className="rounded-[2rem] border-none shadow-xl p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4">{t("recentClients")}</h3>
              <div className="space-y-3">
                {consultant?.orders?.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <div>
                      <div className="font-black text-slate-900">{order.client.name || order.client.email}</div>
                      <div className="text-xs text-slate-400 font-bold">{order.serviceTier.service.name}</div>
                    </div>
                    <Badge className={order.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-700 border-none" : "bg-slate-100 text-slate-500 border-none"}>
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
