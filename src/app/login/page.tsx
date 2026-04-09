'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
      const redirectPath =
        role === 'ADMIN' ? '/admin' :
        role === 'CONSULTANT' ? '/consultant' :
        role === 'CLIENT' ? '/client' : '/dashboard'

      localStorage.setItem('userId', data.user.id)
      localStorage.setItem('role', role)
      router.push(redirectPath)
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Login failed')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{ backgroundImage: "url('/fond.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-[#1B3F7A]/70 backdrop-blur-sm" />

      <button onClick={() => router.back()} className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors">
        ← Retour
      </button>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#1B3F7A] via-[#7AB648] to-[#1B3F7A]" />

          <div className="px-8 py-10">
            <div className="flex justify-center mb-8">
              <Image src="/logo-1772242356501-removebg-preview.png" alt="DSL Consulting" width={140} height={70} className="object-contain" />
            </div>

            <h1 className="text-2xl font-bold text-[#1B3F7A] text-center mb-2">Bienvenue</h1>
            <p className="text-gray-400 text-center text-sm mb-8">Connectez-vous à votre espace</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-5 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jean@entreprise.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B3F7A] focus:border-transparent text-sm bg-gray-50"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                  <Link href="/forgot-password" className="text-xs text-[#7AB648] hover:underline">Mot de passe oublié ?</Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B3F7A] focus:border-transparent text-sm bg-gray-50"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B3F7A] hover:bg-[#152f5c] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-lg"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Pas encore de compte ?{' '}
              <Link href="/register" className="text-[#7AB648] hover:text-[#639a3a] font-semibold">S&apos;inscrire</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/60 text-xs mt-4">
          DSL Consulting — Cabinet de conseil et d&apos;accompagnement
        </p>
      </div>
    </div>
  )
}
