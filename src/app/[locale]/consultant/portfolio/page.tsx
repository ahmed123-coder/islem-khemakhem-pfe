'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, Briefcase, Phone, FileText, Image as ImageIcon, Award } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ConsultantPortfolio() {
  const t = useTranslations('consultantPage.portfolio')
  const [consultant, setConsultant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [certFiles, setCertFiles] = useState<File[]>([])
  const photoInputRef = useRef<HTMLInputElement>(null)
  const cvInputRef = useRef<HTMLInputElement>(null)
  const certInputRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState({
    name: '',
    firstName: '',
    email: '',
    phone: '',
    specialty: '',
    bio: '',
    imageUrl: '',
    cvUrl: '',
    certifications: [] as string[],
  })

  useEffect(() => {
    fetchPortfolio()
    fetchProfile()
  }, [])

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/consultant/portfolio')
      const result = await res.json()
      setConsultant(result.data || result)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/consultant/profile')
      const result = await res.json()
      const data = result.data || result
      setProfile({
        name: data.name || '',
        firstName: data.firstName || '',
        email: data.email || '',
        phone: data.phone ? String(data.phone).replace(/^\+216/, '').replace(/\D/g, '') : '',
        specialty: data.specialty || '',
        bio: data.bio || '',
        imageUrl: data.imageUrl || '',
        cvUrl: data.cvUrl || '',
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
      })
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: keyof typeof profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value as never }))
  }

  const uploadDocument = async (file: File, folder: string) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    const res = await fetch('/api/upload/document', { method: 'POST', body: fd })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error || 'Échec du chargement du fichier.')
    // L'API renvoie { data: { url: "..." }, message } via successResponse
    const data = result.data || result
    return data.url as string
  }

  const uploadImage = async (file: File) => {
    const fd = new FormData()
    fd.append('image', file)
    const res = await fetch('/api/upload/image', { method: 'POST', body: fd })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error || 'Échec du chargement de la photo.')
    // L'API renvoie { data: { imageUrl: "..." }, message } via successResponse
    const data = result.data || result
    return data.imageUrl as string
  }

  const handleSave = async () => {
    const fullName = profile.name.trim()
    const firstName = profile.firstName.trim()
    const phone = profile.phone.replace(/\D/g, '').slice(0, 8)

    if (!fullName || !firstName) {
      toast.error(t('nameRequired'))
      return
    }

    if (!/^[A-Za-zÀ-ÿ\s-]+$/.test(fullName) || !/^[A-Za-zÀ-ÿ\s-]+$/.test(firstName)) {
      toast.error(t('nameLettersOnly'))
      return
    }

    if (phone && !/^[0-9]{8}$/.test(phone)) {
      toast.error(t('phone8Digits'))
      return
    }

    setSaving(true)
    try {
      const [photoUrl, cvUrl] = await Promise.all([
        photoFile ? uploadImage(photoFile) : Promise.resolve(profile.imageUrl || null),
        cvFile ? uploadDocument(cvFile, 'consultant-cvs') : Promise.resolve(profile.cvUrl || null),
      ])
      const certUrls = await Promise.all(certFiles.map(file => uploadDocument(file, 'consultant-certs')))
      const mergedCertifications = [...profile.certifications, ...certUrls]

      const res = await fetch('/api/consultant/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          firstName,
          phone: phone ? `+216${phone}` : null,
          specialty: profile.specialty.trim(),
          bio: profile.bio.trim(),
          imageUrl: photoUrl || null,
          cvUrl: cvUrl || null,
          certifications: mergedCertifications,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Impossible de mettre à jour le profil.')
      toast.success(t('profileUpdated'))
      await fetchProfile()
      setPhotoFile(null)
      setCvFile(null)
      setCertFiles([])
    } catch (error: any) {
      toast.error(error.message || t('errorOccurred'))
    } finally {
      setSaving(false)
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
          <div>
            <h1 className="text-3xl font-black text-slate-900">{t('title')}</h1>
            <p className="text-slate-500 text-sm mt-2">{t('description')}</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black text-xs uppercase tracking-widest px-6">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="rounded-[2rem] border border-slate-100 shadow-xl p-6">
              <div className="text-center">

                {/* Photo de profil — aperçu en direct
                    - si une nouvelle photo est choisie (photoFile) → aperçu local
                    - sinon → photo actuelle (profile.imageUrl) */}
                <div className="w-32 h-32 bg-slate-100 rounded-[2rem] mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  {photoFile ? (
                    <Avatar className="w-full h-full">
                      <AvatarImage src={URL.createObjectURL(photoFile)} alt={profile.name} className="object-cover" />
                      <AvatarFallback className="text-3xl">👤</AvatarFallback>
                    </Avatar>
                  ) : profile.imageUrl ? (
                    <Avatar className="w-full h-full">
                      <AvatarImage src={profile.imageUrl} alt={profile.name} className="object-cover" />
                      <AvatarFallback className="text-3xl">👤</AvatarFallback>
                    </Avatar>
                  ) : (
                    <span className="text-4xl">👤</span>
                  )}
                </div>

                {/* Nom et spécialité — affichage en direct depuis profile
                    (modifiables dans la carte "Profil consultant" à droite) */}
                <h2 className="text-2xl font-black text-slate-900 mb-2">
                  {profile.firstName} {profile.name}
                </h2>
                <p className="text-slate-500 font-medium mb-4">
                  {profile.specialty || t("noSpecialty")}
                </p>

                <div className="border-t border-slate-100 pt-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400 font-bold text-xs uppercase">{t("email")}:</span>
                    <span className="font-black text-slate-900">{consultant?.email}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400 font-bold text-xs uppercase">{t("hourlyRate")}:</span>
                    <span className="font-black text-slate-900">{consultant?.hourlyRate || 0} DT/h</span>
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
              <h3 className="text-xl font-black text-slate-900 mb-4">{t('profileInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs uppercase tracking-widest text-slate-400 font-black">{t('lastName')}</label><Input value={profile.name} onChange={e => updateField('name', e.target.value)} className="mt-2 rounded-xl" /></div>
                <div><label className="text-xs uppercase tracking-widest text-slate-400 font-black">{t('firstName')}</label><Input value={profile.firstName} onChange={e => updateField('firstName', e.target.value)} className="mt-2 rounded-xl" /></div>
                <div><label className="text-xs uppercase tracking-widest text-slate-400 font-black">{t('email')}</label><Input value={profile.email} disabled className="mt-2 rounded-xl bg-slate-100" /></div>
                <div><label className="text-xs uppercase tracking-widest text-slate-400 font-black">{t('phone')}</label><div className="flex mt-2"><span className="inline-flex items-center px-3 rounded-l-xl bg-slate-100 border border-r-0 border-slate-200 text-slate-500 text-sm">+216</span><Input value={profile.phone} onChange={e => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 8))} className="rounded-l-none" placeholder="XX XXX XXX" /></div></div>
                <div className="md:col-span-2"><label className="text-xs uppercase tracking-widest text-slate-400 font-black">{t('specialty')}</label><Input value={profile.specialty} onChange={e => updateField('specialty', e.target.value)} className="mt-2 rounded-xl" /></div>
                <div className="md:col-span-2"><label className="text-xs uppercase tracking-widest text-slate-400 font-black">{t('bio')}</label><textarea value={profile.bio} onChange={e => updateField('bio', e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" /></div>
              </div>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-xl p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4">{t('attachments')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4"><label className="text-xs uppercase tracking-widest text-slate-400 font-black flex items-center gap-2"><ImageIcon className="w-4 h-4" /> {t('photo')}</label><input ref={photoInputRef} type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={e => setPhotoFile(e.target.files?.[0] || null)} /><button type="button" onClick={() => photoInputRef.current?.click()} className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-600">{photoFile ? `📷 ${photoFile.name}` : (profile.imageUrl ? 'Remplacer la photo actuelle' : 'Choisir une photo (PNG/JPG)')}</button></div>
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4"><label className="text-xs uppercase tracking-widest text-slate-400 font-black flex items-center gap-2"><FileText className="w-4 h-4" /> {t('cv')}</label><input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setCvFile(e.target.files?.[0] || null)} /><button type="button" onClick={() => cvInputRef.current?.click()} className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-600">{cvFile ? `📄 ${cvFile.name}` : (profile.cvUrl ? 'Remplacer le CV actuel' : 'Choisir un CV (PDF/DOC)')}</button></div>
                <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4"><label className="text-xs uppercase tracking-widest text-slate-400 font-black flex items-center gap-2"><Award className="w-4 h-4" /> {t('certifications')}</label><input ref={certInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" multiple className="hidden" onChange={e => setCertFiles(Array.from(e.target.files || []))} /><button type="button" onClick={() => certInputRef.current?.click()} className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-600">{certFiles.length > 0 ? `${certFiles.length} certification(s) sélectionnée(s)` : 'Choisir des certifications'}</button>{profile.certifications?.length ? <p className="mt-2 text-xs text-slate-500">Certifications déjà enregistrées : {profile.certifications.length}</p> : null}</div>
              </div>
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