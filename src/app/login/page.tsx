'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (res.ok) {
      const data = await res.json()
      const redirectPath = data.user.role === 'ADMIN' ? '/admin' : '/dashboard'
      router.push(redirectPath)
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-8 py-12">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">D</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">DSL Conseil</span>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Bienvenue</h1>
            <p className="text-gray-500">Connectez-vous à votre espace</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email
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
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Mot de passe
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-700 hover:text-blue-800">
                  Mot de passe oublié ?
                </Link>
              </div>
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
            >
              Se connecter
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 mt-6">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-blue-700 hover:text-blue-800 font-medium">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Blue Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-bold mb-6">Votre espace de conseil digital</h2>
          <p className="text-xl text-blue-100 mb-8">
            Accédez à vos missions, suivez vos indicateurs de performance
            et collaborez avec vos consultants en temps réel.
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-orange-400 text-xl">•</span>
              <span className="text-lg">Suivi des missions en temps réel</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-400 text-xl">•</span>
              <span className="text-lg">Accès aux livrables et rapports</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-400 text-xl">•</span>
              <span className="text-lg">Messagerie sécurisée</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-400 text-xl">•</span>
              <span className="text-lg">Tableaux de bord personnalisés</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
