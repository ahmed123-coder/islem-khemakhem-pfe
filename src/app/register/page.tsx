'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ReCAPTCHA from 'react-google-recaptcha'

export default function RegisterPage() {
  const [tab, setTab] = useState<'CLIENT' | 'CONSULTANT'>('CLIENT')

  const [cFirstName, setCFirstName] = useState('')
  const [cLastName, setCLastName] = useState('')
  const [cPhone, setCPhone] = useState('')
  const [cEmail, setCEmail] = useState('')
  const [cPassword, setCPassword] = useState('')
  const [cConfirm, setCConfirm] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [certFiles, setCertFiles] = useState<File[]>([])
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState('/logo.jpeg')

  useEffect(() => {
    fetch('/api/content/navbar')
      .then(res => res.json())
      .then(data => { if (data.value?.logoUrl) setLogoUrl(data.value.logoUrl) })
      .catch(() => {})
  }, [])

  const switchTab = (t: 'CLIENT' | 'CONSULTANT') => {
    setTab(t)
    setError('')
    setSuccess('')
  }

  const isAlpha = (n: string) => /^[a-zA-Z\u00C0-\u024F\s\-']+$/.test(n.trim())
  const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  const isPhone = (p: string) => /^[+]?[\d\s\-().]{7,20}$/.test(p)
  const isStrongPwd = (p: string) => p.length >= 8

  const validateClient = (): string | null => {
    if (!cFirstName.trim() || !isAlpha(cFirstName)) return 'Le prénom doit contenir uniquement des lettres alphabétiques'
    if (!cLastName.trim() || !isAlpha(cLastName)) return 'Le nom doit contenir uniquement des lettres alphabétiques'
    if (!isEmail(cEmail)) return 'Adresse email invalide (doit contenir @)'
    if (cPhone && !isPhone(cPhone)) return 'Numéro de téléphone invalide (chiffres uniquement)'
    if (!isStrongPwd(cPassword)) return 'Le mot de passe doit contenir au moins 8 caractères'
    if (cPassword !== cConfirm) return 'Les mots de passe ne correspondent pas'
    return null
  }

  const validateConsultant = (): string | null => {
    if (!firstName.trim() || !isAlpha(firstName)) return 'Le prénom doit contenir uniquement des lettres alphabétiques'
    if (!lastName.trim() || !isAlpha(lastName)) return 'Le nom doit contenir uniquement des lettres alphabétiques'
    if (!isEmail(email)) return 'Adresse email invalide (doit contenir @)'
    if (!phone.trim() || !isPhone(phone)) return 'Numéro de téléphone invalide (chiffres uniquement)'
    if (!specialty.trim()) return 'Veuillez indiquer votre domaine de compétence'
    if (!isStrongPwd(password)) return 'Le mot de passe doit contenir au moins 8 caractères'
    if (password !== confirmPassword) return 'Les mots de passe ne correspondent pas'
    if (!cvFile) return 'Veuillez joindre votre CV'
    if (!captchaToken) return "Veuillez confirmer que vous n'êtes pas un robot"
    return null
  }

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const err = validateClient()
    if (err) { setError(err); return }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cEmail, password: cPassword, name: `${cFirstName} ${cLastName}`.trim(), phone: cPhone, role: 'CLIENT' })
    })
    const data = await res.json()
    if (res.ok) setSuccess('Votre compte a été créé. Un administrateur doit valider votre accès avant que vous puissiez vous connecter.')
    else setError(data.error || 'Inscription échouée')
  }

  const handleConsultantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const err = validateConsultant()
    if (err) { setError(err); return }

    setLoading(true)
    try {
      const cvForm = new FormData()
      cvForm.append('file', cvFile!)
      cvForm.append('folder', 'consultant-cvs')
      const cvRes = await fetch('/api/upload/document', { method: 'POST', body: cvForm })
      if (!cvRes.ok) throw new Error('Échec du téléchargement du CV')
      const { url: cvUrl } = await cvRes.json()

      const certUrls: string[] = []
      for (const cert of certFiles) {
        const certForm = new FormData()
        certForm.append('file', cert)
        certForm.append('folder', 'consultant-certifications')
        const certRes = await fetch('/api/upload/document', { method: 'POST', body: certForm })
        if (!certRes.ok) throw new Error("Échec du téléchargement d'une certification")
        const { url } = await certRes.json()
        certUrls.push(url)
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'CONSULTANT', name: `${firstName} ${lastName}`.trim(), email, phone, specialty, password, cvUrl, certificationUrls: certUrls })
      })
      const data = await res.json()
      if (res.ok) setSuccess('Votre demande a été soumise. Un administrateur examinera votre dossier et activera votre compte.')
      else { setError(data.error || 'Inscription échouée'); recaptchaRef.current?.reset(); setCaptchaToken(null) }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400'
  const labelCls = 'block text-sm font-medium text-gray-900 mb-2'

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-8">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Demande envoyée !</h2>
          <p className="text-gray-600 mb-6">{success}</p>
          <Link href="/login" className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors">
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-8 py-12 overflow-y-auto">
        <div className="max-w-md w-full">
          <div className="flex items-center gap-3 mb-10">
            <Image src={logoUrl} alt="Logo" width={50} height={50} className="rounded-lg object-contain" />
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Créer un compte</h1>
            <p className="text-gray-500">Rejoignez notre plateforme de conseil</p>
          </div>

          <div className="flex rounded-lg border border-gray-200 p-1 mb-8 bg-white">
            <button type="button" onClick={() => switchTab('CLIENT')}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${tab === 'CLIENT' ? 'bg-blue-700 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              Espace Client
            </button>
            <button type="button" onClick={() => switchTab('CONSULTANT')}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${tab === 'CONSULTANT' ? 'bg-blue-700 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              Espace Consultant
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</div>}

          {tab === 'CLIENT' && (
            <form onSubmit={handleClientSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Prénom</label>
                  <input type="text" value={cFirstName} onChange={e => setCFirstName(e.target.value)} placeholder="Jean" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Nom</label>
                  <input type="text" value={cLastName} onChange={e => setCLastName(e.target.value)} placeholder="Dupont" required className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Numéro de téléphone</label>
                <input type="tel" value={cPhone} onChange={e => setCPhone(e.target.value)} placeholder="+33 6 00 00 00 00" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={cEmail} onChange={e => setCEmail(e.target.value)} placeholder="jean@entreprise.com" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mot de passe</label>
                <input type="password" value={cPassword} onChange={e => setCPassword(e.target.value)} placeholder="••••••••" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Confirmer le mot de passe</label>
                <input type="password" value={cConfirm} onChange={e => setCConfirm(e.target.value)} placeholder="••••••••" required className={inputCls} />
              </div>
              <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                S'inscrire
              </button>
            </form>
          )}

          {tab === 'CONSULTANT' && (
            <form onSubmit={handleConsultantSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Prénom</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jean" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Nom</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Dupont" required className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Adresse email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jean@entreprise.com" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Numéro de téléphone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+33 6 00 00 00 00" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Domaine de compétence</label>
                <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Ex: Finance, RH, Stratégie, IT..." required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>CV <span className="text-gray-400 font-normal">(PDF uniquement)</span></label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <input type="file" accept=".pdf" onChange={e => setCvFile(e.target.files?.[0] || null)} className="hidden" id="cv-upload" />
                  <label htmlFor="cv-upload" className="flex flex-col items-center cursor-pointer">
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {cvFile
                      ? <span className="text-sm text-blue-700 font-medium">{cvFile.name}</span>
                      : <span className="text-sm text-gray-500">Cliquez pour joindre votre CV</span>}
                  </label>
                </div>
              </div>
              <div>
                <label className={labelCls}>Certifications <span className="text-gray-400 font-normal">(JPG, PNG, PDF — optionnel)</span></label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" multiple onChange={e => setCertFiles(Array.from(e.target.files || []))} className="hidden" id="cert-upload" />
                  <label htmlFor="cert-upload" className="flex flex-col items-center cursor-pointer">
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {certFiles.length > 0
                      ? <span className="text-sm text-blue-700 font-medium">{certFiles.length} fichier(s) sélectionné(s)</span>
                      : <span className="text-sm text-gray-500">Cliquez pour joindre vos certifications</span>}
                  </label>
                </div>
                {certFiles.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {certFiles.map((f, i) => (
                      <li key={i} className="text-xs text-gray-500 flex items-center gap-1"><span className="text-green-500">✓</span> {f.name}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className={labelCls}>Mot de passe</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Confirmer le mot de passe</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required className={inputCls} />
              </div>
              <div>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                  onChange={token => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                {loading ? 'Envoi en cours...' : 'Soumettre ma candidature'}
              </button>
            </form>
          )}

          <p className="text-center text-gray-600 mt-6">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-blue-700 hover:text-blue-800 font-medium">Se connecter</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 items-center justify-center p-12">
        <div className="max-w-lg text-white">
          {tab === 'CLIENT' ? (
            <>
              <h2 className="text-4xl font-bold mb-6">Votre espace de conseil digital</h2>
              <p className="text-xl text-blue-100 mb-8">Accédez à vos missions, suivez vos indicateurs de performance et collaborez avec vos consultants en temps réel.</p>
              <ul className="space-y-4">
                {['Suivi des missions en temps réel', 'Accès aux livrables et rapports', 'Messagerie sécurisée', 'Tableaux de bord personnalisés'].map(item => (
                  <li key={item} className="flex items-start gap-3"><span className="text-orange-400 text-xl">•</span><span className="text-lg">{item}</span></li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold mb-6">Rejoignez notre réseau d'experts</h2>
              <p className="text-xl text-blue-100 mb-8">Partagez votre expertise, développez votre clientèle et gérez vos missions en toute simplicité.</p>
              <ul className="space-y-4">
                {['Gestion des missions simplifiée', 'Accès à une clientèle qualifiée', 'Outils de collaboration intégrés', 'Suivi des paiements en temps réel'].map(item => (
                  <li key={item} className="flex items-start gap-3"><span className="text-orange-400 text-xl">•</span><span className="text-lg">{item}</span></li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
