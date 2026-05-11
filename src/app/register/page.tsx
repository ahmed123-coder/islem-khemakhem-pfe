'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B3F7A] focus:border-transparent text-sm bg-gray-50 transition-all'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

const SECTORS = ['Agriculture', 'Agroalimentaire', 'Banque & Finance', 'BTP & Immobilier', 'Commerce & Distribution', 'Éducation & Formation', 'Énergie', 'Hôtellerie & Tourisme', 'Industrie manufacturière', 'Informatique & Télécoms', 'Logistique & Transport', 'Santé & Pharmaceutique', 'Services aux entreprises', 'Textile & Habillement', 'Autre']

function useCaptcha() {
  const [a] = useState(() => Math.floor(Math.random() * 9) + 1)
  const [b] = useState(() => Math.floor(Math.random() * 9) + 1)
  const [answer, setAnswer] = useState('')
  const isValid = parseInt(answer) === a + b
  return { question: `${a} + ${b} = ?`, answer, setAnswer, isValid }
}

export default function RegisterPage() {
  const [step, setStep] = useState<'CHOOSE' | 'CLIENT' | 'CONSULTANT'>('CHOOSE')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/content/logo')
      .then(res => res.json())
      .then(data => {
        if (data && data.value && data.value.url) {
          setLogoUrl(data.value.url)
        }
      })
      .catch(() => setLogoUrl(null))
  }, [])

  const [client, setClient] = useState({ lastName: '', firstName: '', email: '', phone: '', company: '', sector: '', address: '', needs: '', password: '', confirm: '', privacy: false })
  const [consultant, setConsultant] = useState({ lastName: '', firstName: '', email: '', phone: '', competences: '', password: '', confirm: '', privacy: false })
  
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [certFiles, setCertFiles] = useState<File[]>([])
  const cvRef = useRef<HTMLInputElement>(null)
  const certRef = useRef<HTMLInputElement>(null)

  const clientCaptcha = useCaptcha()
  const consultantCaptcha = useCaptcha()

  const isAlpha = (n: string) => /^[a-zA-Z\u00C0-\u024F\s\-']+$/.test(n.trim())
  const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  const isPhone = (p: string) => /^[+]?[\d\s\-().]{7,20}$/.test(p)
  const isStrongPwd = (p: string) => p.length >= 8

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (client.password !== client.confirm) return setError('Les mots de passe ne correspondent pas.')
    if (!client.privacy) return setError('Veuillez accepter la politique de confidentialité.')
    if (!clientCaptcha.isValid) return setError('Réponse au captcha incorrecte.')
    
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'CLIENT', 
          name: client.lastName, 
          firstName: client.firstName, 
          email: client.email, 
          phone: client.phone, 
          company: client.company, 
          sector: client.sector, 
          address: client.address, 
          needs: client.needs, 
          password: client.password 
        })
      })
      
      if (res.ok) {
        setSuccess('CLIENT')
      } else {
        const d = await res.json()
        setError(d.error || 'Erreur lors de l\'inscription')
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion au serveur.')
    } finally {
      setLoading(false)
    }
  }

  const handleConsultantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (consultant.password !== consultant.confirm) return setError('Les mots de passe ne correspondent pas.')
    if (!consultant.privacy) return setError('Veuillez accepter la politique de confidentialité.')
    if (!consultantCaptcha.isValid) return setError('Réponse au captcha incorrecte.')
    if (!cvFile) return setError('Veuillez joindre votre CV.')
    
    setLoading(true)
    try {
      // 1. Upload CV
      const fd = new FormData()
      fd.append('file', cvFile)
      fd.append('folder', 'consultant-cvs')
      const cvRes = await fetch('/api/upload/document', { method: 'POST', body: fd })
      
      if (!cvRes.ok) {
        const cvErr = await cvRes.json()
        throw new Error(cvErr.error || 'Échec du téléchargement du CV')
      }
      const { url: cvUrl } = await cvRes.json()

      // 2. Upload Certifications
      const certUrls = await Promise.all(certFiles.map(async f => {
        const fd2 = new FormData()
        fd2.append('file', f)
        fd2.append('folder', 'consultant-certs')
        const r = await fetch('/api/upload/document', { method: 'POST', body: fd2 })
        const d = await r.json()
        return d.url
      }))

      // 3. Register Consultant
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'CONSULTANT', 
          name: consultant.lastName, 
          firstName: consultant.firstName, 
          email: consultant.email, 
          phone: consultant.phone, 
          competences: consultant.competences, 
          cvUrl, 
          certUrls, 
          password: consultant.password 
        })
      })
      
      if (res.ok) {
        setSuccess('CONSULTANT')
      } else {
        const d = await res.json()
        setError(d.error || 'Erreur lors de l\'inscription')
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription.')
    } finally {
      setLoading(false)
    }
  }

  const bgStyle = { backgroundImage: "url('/fond.png')", backgroundSize: 'cover', backgroundPosition: 'center' }

  const SuccessModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-4 text-center">
        <div className="w-16 h-16 bg-[#7AB648]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#7AB648]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#1B3F7A] mb-3">Demande envoyée !</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <p className="text-amber-700 text-sm font-medium">⏳ Compte en cours de validation</p>
          <p className="text-amber-600 text-xs mt-1">Votre demande a bien été reçue. Un administrateur examinera votre dossier et activera votre compte dans les plus brefs délais.</p>
        </div>
        <p className="text-gray-400 text-xs mb-5">Vous recevrez une notification dès que votre compte sera activé.</p>
        <Link href="/login" className="block w-full bg-[#1B3F7A] text-white px-6 py-3 rounded-xl hover:bg-[#152f5c] transition-colors text-sm font-semibold">
          Retour à la connexion
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center relative py-8" style={bgStyle}>
      {success && <SuccessModal />}
      <div className="absolute inset-0 bg-[#1B3F7A]/70 backdrop-blur-sm" />
      <button 
        onClick={() => step === 'CHOOSE' ? router.back() : setStep('CHOOSE')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors"
      >
        ← Retour
      </button>

      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#1B3F7A] via-[#7AB648] to-[#1B3F7A]" />
          <div className="px-8 py-8 overflow-y-auto max-h-[88vh]">
            <div className="flex justify-center mb-6">
              <Link href="/">
                <Image src={logoUrl || "/logo-1772242356501-removebg-preview.png"} alt="DSL Consulting" width={130} height={65} className="object-contain hover:opacity-80 transition-opacity" />
              </Link>
            </div>

            {/* CHOOSE STEP */}
            {step === 'CHOOSE' && (
              <>
                <h1 className="text-2xl font-bold text-[#1B3F7A] text-center mb-2">Créer un compte</h1>
                <p className="text-gray-400 text-center text-sm mb-8">Choisissez votre espace</p>
                <div className="space-y-4">
                  <button onClick={() => setStep('CLIENT')} className="w-full flex items-center justify-between bg-[#1B3F7A] hover:bg-[#152f5c] text-white font-medium py-4 px-6 rounded-xl transition-all hover:shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl">👤</div>
                      <div className="text-left">
                        <div className="font-semibold">Espace Client</div>
                        <div className="text-xs text-white/70">Accédez aux services de conseil</div>
                      </div>
                    </div>
                    <span className="text-white/70">→</span>
                  </button>
                  <button onClick={() => setStep('CONSULTANT')} className="w-full flex items-center justify-between bg-white hover:bg-gray-50 text-[#1B3F7A] font-medium py-4 px-6 rounded-xl transition-all border-2 border-[#1B3F7A] hover:shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1B3F7A]/10 rounded-lg flex items-center justify-center text-xl">💼</div>
                      <div className="text-left">
                        <div className="font-semibold">Espace Consultant</div>
                        <div className="text-xs text-gray-500">Proposez vos expertises</div>
                      </div>
                    </div>
                    <span className="text-[#1B3F7A]/50">→</span>
                  </button>
                </div>
                <p className="text-center text-gray-500 text-sm mt-8">
                  Déjà un compte ?{' '}
                  <Link href="/login" className="text-[#7AB648] font-semibold hover:underline">Se connecter</Link>
                </p>
              </>
            )}

            {/* CLIENT FORM */}
            {step === 'CLIENT' && (
              <>
                <h1 className="text-xl font-bold text-[#1B3F7A] mb-1">👤 Espace Client</h1>
                <p className="text-gray-400 text-xs mb-5">Tous les champs sont obligatoires sauf mention contraire</p>
                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}
                
                <form onSubmit={handleClientSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Nom <span className="text-red-500">*</span></label>
                      <input type="text" value={client.lastName} onChange={e => setClient({...client, lastName: e.target.value})} placeholder="Dupont" className={inputCls} pattern="[A-Za-zÀ-ÿ\s\-]+" title="Lettres uniquement" required />
                    </div>
                    <div>
                      <label className={labelCls}>Prénom <span className="text-red-500">*</span></label>
                      <input type="text" value={client.firstName} onChange={e => setClient({...client, firstName: e.target.value})} placeholder="Jean" className={inputCls} pattern="[A-Za-zÀ-ÿ\s\-]+" title="Lettres uniquement" required />
                    </div>
                  </div>
                  
                  <div>
                    <label className={labelCls}>Adresse e-mail <span className="text-red-500">*</span></label>
                    <input type="email" value={client.email} onChange={e => setClient({...client, email: e.target.value})} placeholder="jean@entreprise.com" className={inputCls} required />
                  </div>
                  
                  <div>
                    <label className={labelCls}>Numéro de téléphone <span className="text-red-500">*</span></label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-100 text-gray-600 text-sm">🇹🇳 +216</span>
                      <input type="tel" value={client.phone} onChange={e => setClient({...client, phone: e.target.value.replace(/\D/g, '')})} placeholder="XX XXX XXX" className={`${inputCls} rounded-l-none`} pattern="[0-9]{8}" maxLength={8} title="8 chiffres requis" required />
                    </div>
                  </div>
                  
                  <div>
                    <label className={labelCls}>Nom de l&apos;entreprise <span className="text-red-500">*</span></label>
                    <input type="text" value={client.company} onChange={e => setClient({...client, company: e.target.value})} placeholder="Mon Entreprise SARL" className={inputCls} required />
                  </div>
                  
                  <div>
                    <label className={labelCls}>Secteur d&apos;activité <span className="text-red-500">*</span></label>
                    <select value={client.sector} onChange={e => setClient({...client, sector: e.target.value})} className={inputCls} required>
                      <option value="">Sélectionnez un secteur</option>
                      {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className={labelCls}>Adresse <span className="text-red-500">*</span></label>
                    <input type="text" value={client.address} onChange={e => setClient({...client, address: e.target.value})} placeholder="Rue, Ville, Gouvernorat" className={inputCls} required />
                  </div>
                  
                  <div>
                    <label className={labelCls}>Besoins / Attentes <span className="text-gray-400 text-xs font-normal">(facultatif)</span></label>
                    <textarea value={client.needs} onChange={e => setClient({...client, needs: e.target.value})} placeholder="Décrivez vos besoins..." className={`${inputCls} resize-none`} rows={3} maxLength={500} />
                    <p className="text-xs text-gray-400 mt-1">{client.needs.length}/500 caractères</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Mot de passe <span className="text-red-500">*</span></label>
                      <input type="password" value={client.password} onChange={e => setClient({...client, password: e.target.value})} placeholder="••••••••" className={inputCls} minLength={8} title="Minimum 8 caractères" required />
                    </div>
                    <div>
                      <label className={labelCls}>Confirmation <span className="text-red-500">*</span></label>
                      <input type="password" value={client.confirm} onChange={e => setClient({...client, confirm: e.target.value})} placeholder="••••••••" className={inputCls} required />
                    </div>
                  </div>

                  {/* Captcha */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">🤖 Vérification anti-robot</p>
                    <div className="flex items-center gap-3">
                      <span className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800">{clientCaptcha.question}</span>
                      <input type="number" value={clientCaptcha.answer} onChange={e => clientCaptcha.setAnswer(e.target.value)} placeholder="?" className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center text-sm focus:ring-2 focus:ring-[#1B3F7A]" required />
                      {clientCaptcha.answer && <span className={clientCaptcha.isValid ? 'text-[#7AB648] text-lg' : 'text-red-500 text-lg'}>{clientCaptcha.isValid ? '✓' : '✗'}</span>}
                    </div>
                  </div>

                  {/* Privacy */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={client.privacy} onChange={e => setClient({...client, privacy: e.target.checked})} className="mt-1 w-4 h-4 text-[#1B3F7A] border-gray-300 rounded" required />
                    <span className="text-sm text-gray-600">J&apos;accepte la <Link href="/privacy" className="text-[#7AB648] hover:underline">politique de confidentialité</Link> et les <Link href="/terms" className="text-[#7AB648] hover:underline">conditions d&apos;utilisation</Link> <span className="text-red-500">*</span></span>
                  </label>

                  <button type="submit" disabled={loading} className="w-full bg-[#1B3F7A] hover:bg-[#152f5c] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-[0.98]">
                    {loading ? 'Inscription en cours...' : 'Créer mon compte client'}
                  </button>
                </form>
              </>
            )}

            {/* CONSULTANT FORM */}
            {step === 'CONSULTANT' && (
              <>
                <h1 className="text-xl font-bold text-[#1B3F7A] mb-1">💼 Espace Consultant</h1>
                <p className="text-gray-400 text-xs mb-5">Tous les champs sont obligatoires sauf mention contraire</p>
                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}
                
                <form onSubmit={handleConsultantSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Nom <span className="text-red-500">*</span></label>
                      <input type="text" value={consultant.lastName} onChange={e => setConsultant({...consultant, lastName: e.target.value})} placeholder="Mohamed" className={inputCls} pattern="[A-Za-zÀ-ÿ\s\-]+" required />
                    </div>
                    <div>
                      <label className={labelCls}>Prénom <span className="text-red-500">*</span></label>
                      <input type="text" value={consultant.firstName} onChange={e => setConsultant({...consultant, firstName: e.target.value})} placeholder="Ahmed" className={inputCls} pattern="[A-Za-zÀ-ÿ\s\-]+" required />
                    </div>
                  </div>
                  
                  <div>
                    <label className={labelCls}>Adresse e-mail <span className="text-red-500">*</span></label>
                    <input type="email" value={consultant.email} onChange={e => setConsultant({...consultant, email: e.target.value})} placeholder="ahmed@consultpro.com" className={inputCls} required />
                  </div>
                  
                  <div>
                    <label className={labelCls}>Numéro de téléphone <span className="text-red-500">*</span></label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-100 text-gray-600 text-sm">🇹🇳 +216</span>
                      <input type="tel" value={consultant.phone} onChange={e => setConsultant({...consultant, phone: e.target.value.replace(/\D/g, '')})} placeholder="XX XXX XXX" className={`${inputCls} rounded-l-none`} pattern="[0-9]{8}" maxLength={8} required />
                    </div>
                  </div>
                  
                  <div>
                    <label className={labelCls}>CV <span className="text-red-500">*</span> <span className="text-gray-400 font-normal text-xs">(PDF, DOC)</span></label>
                    <div onClick={() => cvRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#1B3F7A] transition-colors bg-gray-50/50">
                      {cvFile ? <span className="text-sm text-[#1B3F7A] font-medium">📄 {cvFile.name}</span> : <span className="text-sm text-gray-400">Cliquez pour joindre votre CV</span>}
                    </div>
                    <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setCvFile(e.target.files?.[0] || null)} />
                  </div>
                  
                  <div>
                    <label className={labelCls}>Certifications <span className="text-gray-400 font-normal text-xs">(facultatif — PDF, JPG, PNG)</span></label>
                    <div onClick={() => certRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#1B3F7A] transition-colors bg-gray-50/50">
                      {certFiles.length > 0 ? (
                        <div className="space-y-1">
                          {certFiles.map((f, i) => (
                            <div key={i} className="flex items-center justify-between text-sm text-[#1B3F7A] bg-white p-1 rounded-md border border-gray-100">
                              <span className="truncate max-w-[200px]">📎 {f.name}</span>
                              <button type="button" onClick={e => { e.stopPropagation(); setCertFiles(certFiles.filter((_, j) => j !== i)) }} className="text-red-400 text-xs ml-2 hover:text-red-600">✕</button>
                            </div>
                          ))}
                          <p className="text-xs text-[#7AB648] mt-1 font-medium">+ Ajouter d&apos;autres certifications</p>
                        </div>
                      ) : <span className="text-sm text-gray-400">Cliquez pour joindre vos certifications</span>}
                    </div>
                    <input ref={certRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden" onChange={e => setCertFiles(prev => [...prev, ...Array.from(e.target.files || [])])} />
                  </div>
                  
                  <div>
                    <label className={labelCls}>Domaine de compétence <span className="text-gray-400 font-normal text-xs">(facultatif)</span></label>
                    <textarea value={consultant.competences} onChange={e => setConsultant({...consultant, competences: e.target.value})} placeholder="Ex: Management, RH, Finance, Qualité..." className={`${inputCls} resize-none`} rows={2} maxLength={300} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Mot de passe <span className="text-red-500">*</span></label>
                      <input type="password" value={consultant.password} onChange={e => setConsultant({...consultant, password: e.target.value})} placeholder="••••••••" className={inputCls} minLength={8} required />
                    </div>
                    <div>
                      <label className={labelCls}>Confirmation <span className="text-red-500">*</span></label>
                      <input type="password" value={consultant.confirm} onChange={e => setConsultant({...consultant, confirm: e.target.value})} placeholder="••••••••" className={inputCls} required />
                    </div>
                  </div>

                  {/* Captcha */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">🤖 Vérification anti-robot</p>
                    <div className="flex items-center gap-3">
                      <span className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800">{consultantCaptcha.question}</span>
                      <input type="number" value={consultantCaptcha.answer} onChange={e => consultantCaptcha.setAnswer(e.target.value)} placeholder="?" className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center text-sm focus:ring-2 focus:ring-[#1B3F7A]" required />
                      {consultantCaptcha.answer && <span className={consultantCaptcha.isValid ? 'text-[#7AB648] text-lg' : 'text-red-500 text-lg'}>{consultantCaptcha.isValid ? '✓' : '✗'}</span>}
                    </div>
                  </div>

                  {/* Privacy */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={consultant.privacy} onChange={e => setConsultant({...consultant, privacy: e.target.checked})} className="mt-1 w-4 h-4 text-[#1B3F7A] border-gray-300 rounded" required />
                    <span className="text-sm text-gray-600">J&apos;accepte la <Link href="/privacy" className="text-[#7AB648] hover:underline">politique de confidentialité</Link> et les <Link href="/terms" className="text-[#7AB648] hover:underline">conditions d&apos;utilisation</Link> <span className="text-red-500">*</span></span>
                  </label>

                  <button type="submit" disabled={loading} className="w-full bg-[#1B3F7A] hover:bg-[#152f5c] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-[0.98]">
                    {loading ? 'Soumission en cours...' : 'Soumettre ma candidature'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
        <p className="text-center text-white/60 text-xs mt-4">DSL Consulting — Cabinet de conseil et d&apos;accompagnement</p>
      </div>
    </div>
  )
}
