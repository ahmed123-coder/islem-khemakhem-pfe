'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const t = useTranslations('auth.login')
  const tc = useTranslations('common')
  const tb = useTranslations('brand')
  
  const locale = pathname.split('/')[1] || 'en'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    setLoading(false)

    if (res.ok) {
      const data = await res.json()
      const role = data.user.role
      
      const defaultPath =
        role === 'ADMIN' ? `/${locale}/admin` :
        role === 'CONSULTANT' ? `/${locale}/consultant` :
        role === 'CLIENT' ? `/${locale}/client` : `/${locale}/dashboard`

      localStorage.setItem('userId', data.user.id)
      localStorage.setItem('role', role)
      window.dispatchEvent(new CustomEvent('auth-change'))
      
      // Respect redirect param if role is client
      const finalPath = redirect && role === 'CLIENT' ? redirect : defaultPath
      router.push(finalPath)
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || t('failed'))
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{ backgroundImage: "url('/fond.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-[#1B3F7A]/70 backdrop-blur-sm" />

      <button onClick={() => router.back()} className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors">
        ← {tc('back')}
      </button>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#1B3F7A] via-[#7AB648] to-[#1B3F7A]" />

          <div className="px-8 py-10">
            <div className="flex justify-center mb-8">
              <Link href={`/${locale}/`}>
                <Image src={logoUrl || "/logo-1772242356501-removebg-preview.png"} alt="DSL Consulting" width={140} height={70} className="object-contain hover:opacity-80 transition-opacity" />
              </Link>
            </div>

            <h1 className="text-2xl font-bold text-[#1B3F7A] text-center mb-2">{t('title')}</h1>
            <p className="text-gray-400 text-center text-sm mb-8">{t('subtitle')}</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-5 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  {t('email')}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean@entreprise.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">{t('password')}</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? t('submitting') : t('submit')}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              {t('noAccount')}{' '}
              <Link href={`/${locale}/register`} className="text-[#7AB648] hover:text-[#639a3a] font-semibold">{t('registerLink')}</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/60 text-xs mt-4">
          {tb('footer')}
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#1B3F7A]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}