'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'CLIENT' | 'CONSULTANT'>('CLIENT')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: `${firstName} ${lastName}`.trim(), phone, specialty, role })
    })

    const data = await res.json()

    if (res.ok) {
      if (role === 'CONSULTANT') {
        setSuccess('Votre demande a été soumise. Un administrateur activera votre compte.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } else {
      setError(data.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Register Form */}
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Créer un compte</h1>
            <p className="text-gray-500">Rejoignez notre plateforme de conseil</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Type de compte</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="CLIENT" checked={role === 'CLIENT'} onChange={() => setRole('CLIENT')} />
                  <span>Client</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="CONSULTANT" checked={role === 'CONSULTANT'} onChange={() => setRole('CONSULTANT')} />
                  <span>Consultant</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 mb-2">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jean"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 mb-2">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dupont"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">Téléphone</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+33 6 00 00 00 00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {role === 'CONSULTANT' && (
              <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-gray-900 mb-2">Spécialité</label>
                <input
                  type="text"
                  id="specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Ex: Finance, RH, Stratégie..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

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
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Mot de passe
              </label>
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              S'inscrire
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-600 mt-6">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-blue-700 hover:text-blue-800 font-medium">
              Se connecter
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
