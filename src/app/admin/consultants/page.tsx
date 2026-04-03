'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Eye, EyeOff, UserCheck, UserX, FileText, Award, X } from 'lucide-react'

interface Consultant {
  id: string
  email: string
  name: string
  specialty: string | null
  hourlyRate: string | null
  bio: string | null
  imageUrl: string | null
  cvUrl: string | null
  certifications: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  services: { id: string; name: string }[]
  _count: { orders: number; reservations: number; missions: number }
}

interface Service {
  id: string
  name: string
}

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [editConsultant, setEditConsultant] = useState<Consultant | null>(null)
  const [form, setForm] = useState<Partial<Consultant & { password?: string; serviceIds?: string[] }>>({ serviceIds: [] })
  const [showPassword, setShowPassword] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [viewFile, setViewFile] = useState<{ url: string; title: string } | null>(null)

  useEffect(() => { fetchConsultants(); fetchServices() }, [])

  const fetchServices = async () => {
    const res = await fetch('/api/services')
    const data = await res.json()
    setServices(data)
  }

  const fetchConsultants = async () => {
    try {
      const res = await fetch('/api/admin/consultants')
      const data = await res.json()
      if (!Array.isArray(data)) setError(data.error || 'Erreur de chargement')
      setConsultants(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editConsultant ? 'PUT' : 'POST'
    const body = editConsultant ? { id: editConsultant.id, ...form } : form
    const res = await fetch('/api/admin/consultants', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, serviceIds: form.serviceIds || [] })
    })
    if (res.ok) { setForm({ serviceIds: [] }); setEditConsultant(null); fetchConsultants() }
  }

  const deleteConsultant = async (id: string) => {
    if (!confirm('Supprimer ce consultant ?')) return
    const res = await fetch(`/api/admin/consultants/${id}`, { method: 'DELETE' })
    if (res.ok) setConsultants(consultants.filter(c => c.id !== id))
  }

  const toggleActive = async (consultant: Consultant) => {
    const res = await fetch('/api/admin/consultants', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: consultant.id, isActive: !consultant.isActive })
    })
    if (res.ok) fetchConsultants()
  }

  const fixCvUrl = (url: string) => {
    // raw/upload without extension: use fl_inline to serve inline in browser
    if (url.includes('/raw/upload/') && !url.match(/\.[a-z]+$/i)) {
      return url.replace('/raw/upload/', '/raw/upload/fl_inline/')
    }
    // image/upload .pdf: use fl_inline
    if (url.includes('/image/upload/') && url.endsWith('.pdf')) {
      return url.replace('/image/upload/', '/image/upload/fl_inline/')
    }
    return url
  }

  const openFile = (url: string, title: string) => {
    const fixed = fixCvUrl(url)
    window.open(fixed, '_blank')
  }

  const filtered = consultants.filter(c =>
    [c.name, c.email, c.specialty].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return <div className="p-8">Chargement...</div>

  return (
    <div className="p-8">
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestion des consultants</h1>
        <span className="text-sm text-gray-500">{consultants.length} consultant(s)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="p-6 lg:col-span-1 h-fit">
          <h2 className="text-xl font-bold mb-4">{editConsultant ? 'Modifier' : 'Créer'} un consultant</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Nom" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Email" type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} required />
            {!editConsultant && (
              <div className="relative">
                <Input placeholder="Mot de passe" type={showPassword ? 'text' : 'password'} value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}
            <Input placeholder="Spécialité" value={form.specialty || ''} onChange={e => setForm({ ...form, specialty: e.target.value })} />
            <Input placeholder="Taux horaire (€)" type="number" step="0.01" value={form.hourlyRate || ''} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} />
            <Input placeholder="URL de l'image" value={form.imageUrl || ''} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
            <Textarea placeholder="Bio" rows={3} value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} />
            <div className="space-y-2">
              <label className="font-medium text-sm">Services assignés</label>
              <div className="flex flex-col gap-2 p-3 border rounded-md bg-gray-50 max-h-40 overflow-y-auto">
                {services.map(service => (
                  <label key={service.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox"
                      checked={form.serviceIds?.includes(service.id) || false}
                      onChange={e => {
                        const ids = form.serviceIds || []
                        setForm({ ...form, serviceIds: e.target.checked ? [...ids, service.id] : ids.filter(id => id !== service.id) })
                      }}
                    />
                    {service.name}
                  </label>
                ))}
                {services.length === 0 && <span className="text-sm text-gray-400">Aucun service disponible</span>}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive ?? true} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
              Actif
            </label>
            <div className="flex gap-2">
              <Button type="submit">{editConsultant ? 'Mettre à jour' : 'Créer'}</Button>
              {editConsultant && <Button type="button" variant="outline" onClick={() => { setEditConsultant(null); setForm({ serviceIds: [] }) }}>Annuler</Button>}
            </div>
          </form>
        </Card>

        {/* Consultants list */}
        <div className="lg:col-span-2 space-y-4">
          <Input placeholder="Rechercher par nom, email, téléphone, spécialité..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {filtered.map(consultant => (
              <Card key={consultant.id} className={`p-4 border-l-4 ${consultant.isActive ? 'border-l-green-500' : 'border-l-red-400'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{consultant.name}</h3>
                      <Badge variant={consultant.isActive ? 'default' : 'destructive'} className={consultant.isActive ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                        {consultant.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{consultant.email}</p>
                    {consultant.specialty && <p className="text-sm text-gray-500">🎯 {consultant.specialty}</p>}
                    {consultant.hourlyRate && <p className="text-sm text-gray-500">💶 {consultant.hourlyRate} €/h</p>}
                    {consultant.bio && <p className="text-sm text-gray-400 line-clamp-2">{consultant.bio}</p>}
                    <div className="flex gap-3 flex-wrap">
                      {consultant.cvUrl && (
                        <button onClick={() => openFile(consultant.cvUrl!, `CV — ${consultant.name}`)} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                          <FileText size={12} /> Voir le CV
                        </button>
                      )}
                      {consultant.certifications.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Award size={12} className="text-purple-600" />
                          {consultant.certifications.map((url, i) => (
                            <button key={i} onClick={() => openFile(url, `Certification ${i + 1} — ${consultant.name}`)} className="text-xs text-purple-600 hover:underline">
                              Cert. {i + 1}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {consultant.services.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {consultant.services.map(s => (
                          <Badge key={s.id} variant="outline" className="text-xs">{s.name}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-4 text-xs text-gray-400 flex-wrap mt-1">
                      <span>Commandes: <strong>{consultant._count.orders}</strong></span>
                      <span>Réservations: <strong>{consultant._count.reservations}</strong></span>
                      <span>Missions: <strong>{consultant._count.missions}</strong></span>
                      <span>Inscrit le: <strong>{new Date(consultant.createdAt).toLocaleDateString('fr-FR')}</strong></span>
                      <span>Mis à jour: <strong>{new Date(consultant.updatedAt).toLocaleDateString('fr-FR')}</strong></span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" title={consultant.isActive ? 'Désactiver' : 'Activer'} onClick={() => toggleActive(consultant)}>
                      {consultant.isActive ? <UserX size={16} className="text-red-500" /> : <UserCheck size={16} className="text-green-500" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditConsultant(consultant); setForm({ ...consultant, serviceIds: consultant.services.map(s => s.id) }) }}>
                      <Pencil size={16} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteConsultant(consultant.id)}><Trash2 size={16} /></Button>
                  </div>
                </div>
              </Card>
            ))}
            {filtered.length === 0 && <p className="text-center text-gray-400 py-8">Aucun consultant trouvé</p>}
          </div>
        </div>
      </div>

      {/* File viewer modal */}
      {viewFile && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewFile(null)}>
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900 truncate">{viewFile.title}</h3>
              <div className="flex items-center gap-2">
                <a href={viewFile.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">Ouvrir dans un nouvel onglet</a>
                <button onClick={() => setViewFile(null)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {viewFile.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={viewFile.url} alt={viewFile.title} className="w-full h-full object-contain p-4" />
              ) : (
                <object
                  data={viewFile.url}
                  type="application/pdf"
                  className="w-full min-h-[70vh]"
                >
                  <p className="p-8 text-center text-gray-500">
                    Impossible d'afficher le PDF.{' '}
                    <a href={viewFile.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Télécharger</a>
                  </p>
                </object>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
