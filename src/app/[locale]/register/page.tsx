'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
  const defaultLogo = '/logo.png'
  const [step, setStep] = useState<'CHOOSE' | 'CLIENT' | 'CONSULTANT'>('CHOOSE')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string>(defaultLogo)
  const router = useRouter()
  const pathname = usePathname()
  const tr = useTranslations('auth.register')
  const tc = useTranslations('common')
  const tb = useTranslations('brand')
  const locale = pathname.split('/')[1] || 'en'

  useEffect(() => {
    fetch('/api/content/logo')
      .then(res => res.json())
      .then(data => {
        const val = data?.data?.value || data?.value;
        if (val && val.url) {
          setLogoUrl(val.url)
        }
      })
      .catch(() => setLogoUrl(defaultLogo))
  }, [])

  const [client, setClient] = useState({ lastName: '', firstName: '', email: '', phone: '', company: '', matriculeFiscale: '', sector: '', address: '', needs: '', password: '', confirm: '', privacy: false })
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
    
    if (client.password !== client.confirm) return setError(tr('passwordMismatch'))
    if (!client.privacy) return setError(tr('privacyRequired'))
    if (!clientCaptcha.isValid) return setError(tr('captchaInvalid'))
    
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
          matriculeFiscale: client.matriculeFiscale, 
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
        setError(d.error || tr('genericError'))
      }
    } catch (err) {
      setError(tr('genericError'))
    } finally {
      setLoading(false)
    }
  }

  const handleConsultantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (consultant.password !== consultant.confirm) return setError(tr('passwordMismatch'))
    if (!consultant.privacy) return setError(tr('privacyRequired'))
    if (!consultantCaptcha.isValid) return setError(tr('captchaInvalid'))
    if (!cvFile) return setError(tr('cvRequired'))
    
    setLoading(true)
    try {
      // 1. Upload CV
      const fd = new FormData()
      fd.append('file', cvFile)
      fd.append('folder', 'consultant-cvs')
      const cvRes = await fetch('/api/upload/document', { method: 'POST', body: fd })
      
      if (!cvRes.ok) {
        const cvErr = await cvRes.json()
        throw new Error(cvErr.error || tr('uploadError'))
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
        setError(d.error || tr('genericError'))
      }
    } catch (err: any) {
      setError(err.message || tr('genericError'))
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
        <h2 className="text-xl font-bold text-[#1B3F7A] mb-3">{tr('successTitle')}</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <p className="text-amber-700 text-sm font-medium">⏳ {tr('successPending')}</p>
          <p className="text-amber-600 text-xs mt-1">{tr('successDesc')}</p>
        </div>
        <p className="text-gray-400 text-xs mb-5">{tr('successNotification')}</p>
        <Link href={`/${locale}/login`} className="block w-full bg-[#1B3F7A] text-white px-6 py-3 rounded-xl hover:bg-[#152f5c] transition-colors text-sm font-semibold">
          {tr('backToLogin')}
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
        ← {tc('back')}
      </button>

      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#1B3F7A] via-[#7AB648] to-[#1B3F7A]" />
          <div className="px-8 py-8 overflow-y-auto max-h-[88vh]">
            <div className="flex justify-center mb-6">
              <Link href={`/${locale}/`}>
                <Image src={logoUrl} alt="DSL Consulting" width={130} height={65} className="object-contain hover:opacity-80 transition-opacity" />
              </Link>
            </div>

            {/* CHOOSE STEP */}
            {step === 'CHOOSE' && (
              <>
                <h1 className="text-2xl font-bold text-[#1B3F7A] text-center mb-2">{tr('title')}</h1>
                <p className="text-gray-400 text-center text-sm mb-8">{tr('chooseTitle')}</p>
                <div className="space-y-4">
                  <button onClick={() => setStep('CLIENT')} className="w-full flex items-center justify-between bg-[#1B3F7A] hover:bg-[#152f5c] text-white font-medium py-4 px-6 rounded-xl transition-all hover:shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl">👤</div>
                      <div className="text-left">
                        <div className="font-semibold">{tr('clientSpace')}</div>
                        <div className="text-xs text-white/70">{tr('clientDesc')}</div>
                      </div>
                    </div>
                    <span className="text-white/70">→</span>
                  </button>
                  <button onClick={() => setStep('CONSULTANT')} className="w-full flex items-center justify-between bg-white hover:bg-gray-50 text-[#1B3F7A] font-medium py-4 px-6 rounded-xl transition-all border-2 border-[#1B3F7A] hover:shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1B3F7A]/10 rounded-lg flex items-center justify-center text-xl">💼</div>
                      <div className="text-left">
                        <div className="font-semibold">{tr('consultantSpace')}</div>
                        <div className="text-xs text-gray-500">{tr('consultantDesc')}</div>
                      </div>
                    </div>
                    <span className="text-[#1B3F7A]/50">→</span>
                  </button>
                </div>
                <p className="text-center text-gray-500 text-sm mt-8">
                  {tr('hasAccount')}{' '}
                  <Link href={`/${locale}/login`} className="text-[#7AB648] font-semibold hover:underline">{tr('loginLink')}</Link>
                </p>
              </>
            )}

            {/* CLIENT FORM */}
            {step === 'CLIENT' && (
              <>
                <h1 className="text-xl font-bold text-[#1B3F7A] mb-1">👤 {tr('clientSpace')}</h1>
                <p className="text-gray-400 text-xs mb-5">{tr('allFieldsRequired')}</p>
                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}
                
                <form onSubmit={handleClientSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>{tr('lastName')} <span className="text-red-500">*</span></label>
                      <input type="text" value={client.lastName} onChange={e => setClient({...client, lastName: e.target.value})} 
                      placeholder="Nom" className={inputCls} pattern="[A-Za-zÀ-ÿ\s\-]+" required />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('firstName')} <span className="text-red-500">*</span></label>
                      <input type="text" value={client.firstName} onChange={e => setClient({...client, firstName: e.target.value})} 
                      placeholder="Prénom" className={inputCls} pattern="[A-Za-zÀ-ÿ\s\-]+" required />
                    </div>
                  </div>
                  
                  <div>
                    <label className={labelCls}>{tr('email')} <span className="text-red-500">*</span></label>
                    <input type="email" value={client.email} onChange={e => setClient({...client, email: e.target.value})} 
                    placeholder="Email" className={inputCls} required />
                  </div>
                  
                  <div>
                    <label className={labelCls}>{tr('phone')} <span className="text-red-500">*</span></label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-100 text-gray-600 text-sm">{tr('phonePrefix')}</span>
                      <input type="tel" value={client.phone} onChange={e => setClient({...client, phone: e.target.value.replace(/\D/g, '')})} 
                      placeholder="XX XXX XXX" className={`${inputCls} rounded-l-none`} pattern="[0-9]{8}" maxLength={8} required />
                    </div>
                  </div>
                  
                  <div>
                    <label className={labelCls}>{tr('company')} <span className="text-red-500">*</span></label>
                    <input type="text" value={client.company} onChange={e => setClient({...client, company: e.target.value})} 
                    placeholder="Nom de l'entreprise" className={inputCls} required />
                  </div>
                  
                  <div>
                    <label className={labelCls}>{tr('matriculeFiscale')} <span className="text-red-500">*</span></label>
                    <input type="text" value={client.matriculeFiscale} onChange={e => setClient({...client, matriculeFiscale: e.target.value})} 
                    placeholder="1234567X/A/000" className={inputCls} required />
                  </div>
                  
                  <div>
                    <label className={labelCls}>{tr('sector')} <span className="text-red-500">*</span></label>
                    <select value={client.sector} onChange={e => setClient({...client, sector: e.target.value})} className={inputCls} required>
                      <option value="">{tr('selectSector')}</option>
                      {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className={labelCls}>{tr('address')} <span className="text-red-500">*</span></label>
                    <input type="text" value={client.address} onChange={e => setClient({...client, address: e.target.value})} 
                    placeholder="Adresse" className={inputCls} required />
                  </div>
                  
                  <div>
                    <label className={labelCls}>{tr('needs')} <span className="text-gray-400 text-xs font-normal">{tr('optional')}</span></label>
                    <textarea value={client.needs} onChange={e => setClient({...client, needs: e.target.value})} placeholder={tr('describeNeeds')} className={`${inputCls} resize-none`} rows={3} maxLength={500} />
                    <p className="text-xs text-gray-400 mt-1">{client.needs.length}/500</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>{tr('password')} <span className="text-red-500">*</span></label>
                      <input type="password" value={client.password} onChange={e => setClient({...client, password: e.target.value})} placeholder="••••••••" className={inputCls} minLength={8} required />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('confirmPassword')} <span className="text-red-500">*</span></label>
                      <input type="password" value={client.confirm} onChange={e => setClient({...client, confirm: e.target.value})} placeholder="••••••••" className={inputCls} required />
                    </div>
                  </div>

                  {/* Captcha */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">🤖 {tr('captcha')}</p>
                    <div className="flex items-center gap-3">
                      <span className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800">{clientCaptcha.question}</span>
                      <input type="number" value={clientCaptcha.answer} onChange={e => clientCaptcha.setAnswer(e.target.value)} placeholder="?" className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center text-sm focus:ring-2 focus:ring-[#1B3F7A]" required />
                      {clientCaptcha.answer && <span className={clientCaptcha.isValid ? 'text-[#7AB648] text-lg' : 'text-red-500 text-lg'}>{clientCaptcha.isValid ? '✓' : '✗'}</span>}
                    </div>
                  </div>

                  {/* Privacy */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={client.privacy} onChange={e => setClient({...client, privacy: e.target.checked})} className="mt-1 w-4 h-4 text-[#1B3F7A] border-gray-300 rounded" required />
                    <span className="text-sm text-gray-600">
                      {tr.rich('acceptPrivacy', {
                        privacy: (chunks) => <Link href={`/${locale}/privacy`} className="text-[#7AB648] hover:underline">{chunks}</Link>,
                        terms: (chunks) => <Link href={`/${locale}/terms`} className="text-[#7AB648] hover:underline">{chunks}</Link>
                      })}
                    </span>
                    <span className="text-red-500">*</span>
                  </label>

                  <button type="submit" disabled={loading} className="w-full bg-[#1B3F7A] hover:bg-[#152f5c] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-[0.98]">
                    {loading ? tr('submitting') : tr('submitClient')}
                  </button>
                </form>
              </>
            )}

            {/* CONSULTANT FORM */}
            {step === 'CONSULTANT' && (
              <>
                <h1 className="text-xl font-bold text-[#1B3F7A] mb-1">💼 {tr('consultantSpace')}</h1>
                <p className="text-gray-400 text-xs mb-5">{tr('allFieldsRequired')}</p>
                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}
                
                <form onSubmit={handleConsultantSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>{tr('lastName')} <span className="text-red-500">*</span></label>
                      <input type="text" value={consultant.lastName} onChange={e => setConsultant({...consultant, lastName: e.target.value})} placeholder="Nom" className={inputCls} pattern="[A-Za-zÀ-ÿ\s\-]+" required />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('firstName')} <span className="text-red-500">*</span></label>
                      <input type="text" value={consultant.firstName} onChange={e => setConsultant({...consultant, firstName: e.target.value})} placeholder="Prénom" className={inputCls} pattern="[A-Za-zÀ-ÿ\s\-]+" required />
                    </div>
                  </div>
                  
                  <div>
                    <label className={labelCls}>{tr('email')} <span className="text-red-500">*</span></label>
                    <input type="email" value={consultant.email} onChange={e => setConsultant({...consultant, email: e.target.value})} placeholder="Email" className={inputCls} required />
                  </div>
                  
                  <div>
                    <label className={labelCls}>{tr('phone')} <span className="text-red-500">*</span></label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-100 text-gray-600 text-sm">{tr('phonePrefix')}</span>
                      <input type="tel" value={consultant.phone} onChange={e => setConsultant({...consultant, phone: e.target.value.replace(/\D/g, '')})} placeholder="XX XXX XXX" className={`${inputCls} rounded-l-none`} pattern="[0-9]{8}" maxLength={8} required />
                    </div>
                  </div>
                  
                  <div>
                    <label className={labelCls}>{tr('cv')} <span className="text-red-500">*</span> <span className="text-gray-400 font-normal text-xs">{tr('cvFormats')}</span></label>
                    <div onClick={() => cvRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#1B3F7A] transition-colors bg-gray-50/50">
                      {cvFile ? <span className="text-sm text-[#1B3F7A] font-medium">📄 {cvFile.name}</span> : <span className="text-sm text-gray-400">{tr('clickToUploadCV')}</span>}
                    </div>
                    <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setCvFile(e.target.files?.[0] || null)} />
                  </div>
                  
                  <div>
                    <label className={labelCls}>{tr('certifications')} <span className="text-gray-400 font-normal text-xs">{tr('certFormats')}</span></label>
                    <div onClick={() => certRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#1B3F7A] transition-colors bg-gray-50/50">
                      {certFiles.length > 0 ? (
                        <div className="space-y-1">
                          {certFiles.map((f, i) => (
                            <div key={i} className="flex items-center justify-between text-sm text-[#1B3F7A] bg-white p-1 rounded-md border border-gray-100">
                              <span className="truncate max-w-[200px]">📎 {f.name}</span>
                              <button type="button" onClick={e => { e.stopPropagation(); setCertFiles(certFiles.filter((_, j) => j !== i)) }} className="text-red-400 text-xs ml-2 hover:text-red-600">✕</button>
                            </div>
                          ))}
                          <p className="text-xs text-[#7AB648] mt-1 font-medium">{tr('addMore')}</p>
                        </div>
                      ) : <span className="text-sm text-gray-400">{tr('clickToUploadCert')}</span>}
                    </div>
                    <input ref={certRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden" onChange={e => setCertFiles(prev => [...prev, ...Array.from(e.target.files || [])])} />
                  </div>
                  
                  <div>
                    <label className={labelCls}>{tr('competence')} <span className="text-gray-400 font-normal text-xs">{tr('optional')}</span></label>
                    <textarea value={consultant.competences} onChange={e => setConsultant({...consultant, competences: e.target.value})} placeholder={tr('competencePlaceholder')} className={`${inputCls} resize-none`} rows={2} maxLength={300} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>{tr('password')} <span className="text-red-500">*</span></label>
                      <input type="password" value={consultant.password} onChange={e => setConsultant({...consultant, password: e.target.value})} placeholder="••••••••" className={inputCls} minLength={8} required />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('confirmPassword')} <span className="text-red-500">*</span></label>
                      <input type="password" value={consultant.confirm} onChange={e => setConsultant({...consultant, confirm: e.target.value})} placeholder="••••••••" className={inputCls} required />
                    </div>
                  </div>

                  {/* Captcha */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">🤖 {tr('captcha')}</p>
                    <div className="flex items-center gap-3">
                      <span className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800">{consultantCaptcha.question}</span>
                      <input type="number" value={consultantCaptcha.answer} onChange={e => consultantCaptcha.setAnswer(e.target.value)} placeholder="?" className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center text-sm focus:ring-2 focus:ring-[#1B3F7A]" required />
                      {consultantCaptcha.answer && <span className={consultantCaptcha.isValid ? 'text-[#7AB648] text-lg' : 'text-red-500 text-lg'}>{consultantCaptcha.isValid ? '✓' : '✗'}</span>}
                    </div>
                  </div>

                  {/* Privacy */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={consultant.privacy} onChange={e => setConsultant({...consultant, privacy: e.target.checked})} className="mt-1 w-4 h-4 text-[#1B3F7A] border-gray-300 rounded" required />
                    <span className="text-sm text-gray-600">
                      {tr.rich('acceptPrivacy', {
                        privacy: (chunks) => <Link href={`/${locale}/privacy`} className="text-[#7AB648] hover:underline">{chunks}</Link>,
                        terms: (chunks) => <Link href={`/${locale}/terms`} className="text-[#7AB648] hover:underline">{chunks}</Link>
                      })}
                    </span>
                    <span className="text-red-500">*</span>
                  </label>

                  <button type="submit" disabled={loading} className="w-full bg-[#7AB648] hover:bg-[#639a3a] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-[0.98]">
                    {loading ? tr('submitting') : tr('submitConsultant')}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
        <p className="text-center text-white/60 text-xs mt-4">{tb('footer')}</p>
      </div>
    </div>
  )
}
