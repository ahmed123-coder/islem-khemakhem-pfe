'use client'
// src/app/[locale]/client/settings/page.tsx

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  User, Mail, Phone, Building2, MapPin,
  CreditCard, Calendar, FileText, Briefcase,
  CheckCircle2, AlertCircle, Save, Loader2
} from 'lucide-react'

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B3F7A] focus:border-transparent text-sm bg-gray-50 transition-all outline-none'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

const SECTORS = [
  'Agriculture', 'Agroalimentaire', 'Banque & Finance',
  'BTP & Immobilier', 'Commerce & Distribution', 'Éducation & Formation',
  'Énergie', 'Hôtellerie & Tourisme', 'Industrie manufacturière',
  'Informatique & Télécoms', 'Logistique & Transport',
  'Santé & Pharmaceutique', 'Services aux entreprises',
  'Textile & Habillement', 'Autre'
]

export default function ClientSettingsPage() {
  // ── Tous les champs du client ────────────────────────────────────
  const [profile, setProfile] = useState({
    name: '',
    firstName: '',
    email: '',
    phone: '',
    company: '',
    matriculeFiscale: '',
    sector: '',
    address: '',
    needs: '',
  })

  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // ── Chargement du profil au montage ──────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch('/api/client/profile').then(r => r.json()),
      fetch('/api/client/subscription').then(r => r.json()).catch(() => null)
    ]).then(([profileRes, subRes]) => {
      const data = profileRes.data || profileRes
      setProfile({
        name:             data.name             || '',
        firstName:        data.firstName        || '',
        email:            data.email            || '',
        phone:            data.phone?.replace('+216', '') || '',
        company:          data.company          || '',
        matriculeFiscale: data.matriculeFiscale || '',
        sector:           data.sector           || '',
        address:          data.address          || '',
        needs:            data.needs            || '',
      })
      if (subRes) setSubscription(subRes.data || subRes)
    }).finally(() => setLoading(false))
  }, [])

  // ── Mise à jour d'un champ ───────────────────────────────────────
  const update = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
    setSaveStatus('idle')
  }

  // ── Sauvegarde ───────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    setSaveStatus('idle')
    try {
      const res = await fetch('/api/client/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:             profile.name,
          firstName:        profile.firstName,
          phone:            profile.phone ? '+216' + profile.phone.replace(/\D/g, '') : '',
          company:          profile.company,
          matriculeFiscale: profile.matriculeFiscale,
          sector:           profile.sector,
          address:          profile.address,
          needs:            profile.needs || null,
        })
      })

      if (res.ok) {
        setSaveStatus('success')
        // ✅ Synchronise le nom dans le Header du dashboard
        window.dispatchEvent(new CustomEvent('profile-updated', {
          detail: { name: profile.name, firstName: profile.firstName }
        }))
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex h-full items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1B3F7A] border-t-transparent" />
        <p className="text-sm text-gray-500 font-medium">Chargement...</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">

      {/* ── Titre ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-7 bg-[#1B3F7A] rounded-full" />
          <h1 className="text-2xl font-bold text-gray-900">Paramètres du compte</h1>
        </div>
        <p className="text-gray-500 text-sm ml-3">
          Gérez vos informations personnelles et professionnelles
        </p>
      </div>

      {/* ── Informations personnelles ── */}
      <Card className="p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-[#1B3F7A]/10 rounded-xl flex items-center justify-center">
            <User className="w-4 h-4 text-[#1B3F7A]" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Informations personnelles</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Nom */}
          <div>
            <label className={labelCls}>Nom <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={profile.name}
              onChange={e => update('name', e.target.value)}
              placeholder="Ben Ali"
              className={inputCls}
            />
          </div>

          {/* Prénom */}
          <div>
            <label className={labelCls}>Prénom <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={profile.firstName}
              onChange={e => update('firstName', e.target.value)}
              placeholder="Mohamed"
              className={inputCls}
            />
          </div>

          {/* Email — non modifiable */}
          <div className="md:col-span-2">
            <label className={labelCls}>
              <span className="flex items-center gap-1.5">
                <Mail size={13} className="text-gray-400" />
                Adresse e-mail
                <span className="ml-auto text-xs text-gray-400 font-normal">Non modifiable</span>
              </span>
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className={`${inputCls} opacity-60 cursor-not-allowed`}
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-gray-400" />
                Téléphone
              </span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-100 text-gray-600 text-sm font-medium whitespace-nowrap">
                🇹🇳 +216
              </span>
              <input
                type="tel"
                value={profile.phone}
                onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="XX XXX XXX"
                maxLength={8}
                className={`${inputCls} rounded-l-none`}
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-gray-400" />
                Adresse
              </span>
            </label>
            <input
              type="text"
              value={profile.address}
              onChange={e => update('address', e.target.value)}
              placeholder="Rue, Ville, Gouvernorat"
              className={inputCls}
            />
          </div>

        </div>
      </Card>

      {/* ── Informations professionnelles ── */}
      <Card className="p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-[#7AB648]/10 rounded-xl flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-[#7AB648]" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Informations professionnelles</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Entreprise */}
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-1.5">
                <Building2 size={13} className="text-gray-400" />
                Nom de l'entreprise
              </span>
            </label>
            <input
              type="text"
              value={profile.company}
              onChange={e => update('company', e.target.value)}
              placeholder="Mon Entreprise SARL"
              className={inputCls}
            />
          </div>

          {/* Matricule fiscale */}
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-1.5">
                <FileText size={13} className="text-gray-400" />
                Matricule fiscale
              </span>
            </label>
            <input
              type="text"
              value={profile.matriculeFiscale}
              onChange={e => update('matriculeFiscale', e.target.value.toUpperCase())}
              placeholder="1234567A"
              className={inputCls}
            />
            {profile.matriculeFiscale && !/^\d{7}[A-Z]/.test(profile.matriculeFiscale) && (
              <p className="text-xs text-amber-500 mt-1">⚠️ Format : 7 chiffres + 1 lettre (ex: 1234567A)</p>
            )}
          </div>

          {/* Secteur d'activité */}
          <div className="md:col-span-2">
            <label className={labelCls}>
              <span className="flex items-center gap-1.5">
                <Briefcase size={13} className="text-gray-400" />
                Secteur d'activité
              </span>
            </label>
            <select
              value={profile.sector}
              onChange={e => update('sector', e.target.value)}
              className={inputCls}
            >
              <option value="">Sélectionnez un secteur</option>
              {SECTORS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Besoins */}
          <div className="md:col-span-2">
            <label className={labelCls}>
              <span className="flex items-center gap-1.5">
                <FileText size={13} className="text-gray-400" />
                Besoins / Attentes
                <span className="ml-auto text-xs text-gray-400 font-normal">Facultatif</span>
              </span>
            </label>
            <textarea
              value={profile.needs}
              onChange={e => update('needs', e.target.value)}
              placeholder="Décrivez vos besoins en conseil..."
              rows={3}
              maxLength={500}
              className={`${inputCls} resize-none`}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{profile.needs.length}/500</p>
          </div>

        </div>
      </Card>

      {/* ── Bouton sauvegarde + message ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#1B3F7A] hover:bg-[#152f5c] disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md active:scale-[0.98] text-sm"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
          ) : (
            <><Save className="w-4 h-4" /> Enregistrer les modifications</>
          )}
        </button>

        {saveStatus === 'success' && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Profil mis à jour avec succès
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Erreur lors de la mise à jour
          </div>
        )}
      </div>

      {/* ── Abonnement ── */}
      {subscription && (
        <Card className="p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Mon abonnement</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <CreditCard size={14} className="text-gray-400" /> Plan
              </span>
              <Badge className="bg-[#1B3F7A] text-white">{subscription.plan}</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" /> Statut
              </span>
              <Badge className={subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                {subscription.status}
              </Badge>
            </div>
            {subscription.endDate && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Prochaine facturation</span>
                <span className="text-sm font-medium">
                  {new Date(subscription.endDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

    </div>
  )
}