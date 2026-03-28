'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function Services() {
  const router = useRouter()
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [pendingService, setPendingService] = useState<any>(null)
  const [pendingTier, setPendingTier] = useState<any>(null)

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentService, setPaymentService] = useState<any>(null)
  const [paymentTier, setPaymentTier] = useState<any>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardName, setCardName] = useState('')
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  // Booking flow state
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedTier, setSelectedTier] = useState<any>(null)
  const [consultants, setConsultants] = useState<any[]>([])
  const [selectedConsultant, setSelectedConsultant] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number>(1)
  const [submitting, setSubmitting] = useState(false)
  const [loadingConsultants, setLoadingConsultants] = useState(false)
  const [successOrder, setSuccessOrder] = useState<any>(null)

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setIsLoggedIn(data?.role === 'CLIENT')
      })
      .catch(() => setIsLoggedIn(false))
  }, [])

  // Fetch consultants only after payment is done
  useEffect(() => {
    if (selectedTier && isPaid) {
      setLoadingConsultants(true)
      const startDate = new Date().toISOString().split('T')[0]
      fetch(`/api/consultants/schedule?startDate=${startDate}&days=7&serviceTierId=${selectedTier.id}`)
        .then(r => r.json())
        .then(data => {
          setConsultants(Array.isArray(data) ? data : [])
          setLoadingConsultants(false)
        })
        .catch(() => {
          setConsultants([])
          setLoadingConsultants(false)
        })
    }
  }, [selectedTier, isPaid])

  const hours = Array.from({ length: 9 }, (_, i) => i + 9)
  const dates = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  }), [])

  const isSlotBlocked = (consultantId: string, date: Date, hour: number) => {
    const consultant = consultants.find(c => c.id === consultantId)
    if (!consultant) return false
    const slotStart = new Date(date)
    slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = new Date(slotStart)
    slotEnd.setHours(hour + selectedDuration, 0, 0, 0)
    return consultant.reservations?.some((r: any) => {
      const resStart = new Date(r.startTime)
      const resEnd = new Date(r.endTime)
      return slotStart < resEnd && slotEnd > resStart
    })
  }

  const handleTierSelect = (service: any, tier: any) => {
    if (!isLoggedIn) {
      setPendingService(service)
      setPendingTier(tier)
      setAuthError('')
      setAuthEmail('')
      setAuthPassword('')
      setAuthName('')
      setShowAuthModal(true)
      return
    }
    // Show payment modal
    setPaymentService(service)
    setPaymentTier(tier)
    setCardNumber('')
    setCardExpiry('')
    setCardCvc('')
    setCardName('')
    setPaymentProcessing(false)
    setPaymentSuccess(false)
    setShowPaymentModal(true)
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 16)
    return v.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 4)
    if (v.length >= 3) return v.slice(0, 2) + '/' + v.slice(2)
    return v
  }

  const getCardBrand = (num: string) => {
    const n = num.replace(/\s/g, '')
    if (n.startsWith('4')) return { name: 'Visa', color: 'text-blue-600', icon: '💳' }
    if (n.startsWith('5')) return { name: 'Mastercard', color: 'text-red-500', icon: '💳' }
    if (n.startsWith('3')) return { name: 'Amex', color: 'text-green-600', icon: '💳' }
    return null
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false)
      setPaymentSuccess(true)

      // After success animation, proceed to booking
      setTimeout(() => {
        setShowPaymentModal(false)
        setIsPaid(true)
        setSelectedService(paymentService)
        setSelectedTier(paymentTier)
        setSelectedConsultant('')
        setSelectedDate(null)
        setSelectedStartHour(null)
        setSuccessOrder(null)
        toast.success('Paiement effectué avec succès !')
      }, 1500)
    }, 2000)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    try {
      const endpoint = authTab === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = authTab === 'login' 
        ? { email: authEmail, password: authPassword }
        : { email: authEmail, password: authPassword, name: authName }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        setAuthError(data.error || 'Erreur d\'authentification')
        setAuthLoading(false)
        return
      }

      // Auth succeeded
      setIsLoggedIn(true)
      setShowAuthModal(false)
      toast.success(authTab === 'login' ? 'Connexion réussie !' : 'Compte créé avec succès !')

      // Resume the booking flow — show payment modal
      if (pendingService && pendingTier) {
        setPaymentService(pendingService)
        setPaymentTier(pendingTier)
        setCardNumber('')
        setCardExpiry('')
        setCardCvc('')
        setCardName('')
        setPaymentProcessing(false)
        setPaymentSuccess(false)
        setShowPaymentModal(true)
        setPendingService(null)
        setPendingTier(null)
      }
    } catch (err) {
      setAuthError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!selectedTier || !selectedConsultant || !selectedDate || selectedStartHour === null || submitting) return

    const startTime = new Date(selectedDate)
    startTime.setHours(selectedStartHour, 0, 0, 0)
    const endTime = new Date(startTime)
    endTime.setHours(selectedStartHour + selectedDuration, 0, 0, 0)

    setSubmitting(true)
    try {
      const res = await fetch('/api/client/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceTierId: selectedTier.id,
          consultantId: selectedConsultant,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        })
      })

      if (res.ok) {
        const data = await res.json()
        setSuccessOrder(data)
        toast.success('Commande créée avec succès !')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la commande')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const resetBooking = () => {
    setSelectedService(null)
    setSelectedTier(null)
    setConsultants([])
    setSelectedConsultant('')
    setSelectedDate(null)
    setSelectedStartHour(null)
    setSuccessOrder(null)
  }

  const getTierIcon = (tierType: string) => {
    switch (tierType) {
      case 'BASIC': return '🥉'
      case 'STANDARD': return '🥈'
      case 'PREMIUM': return '🥇'
      default: return '📦'
    }
  }

  const getTierColor = (tierType: string) => {
    switch (tierType) {
      case 'BASIC': return 'from-gray-500 to-gray-600'
      case 'STANDARD': return 'from-blue-500 to-indigo-600'
      case 'PREMIUM': return 'from-amber-500 to-orange-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getTierBorder = (tierType: string) => {
    switch (tierType) {
      case 'BASIC': return 'border-gray-200 hover:border-gray-400'
      case 'STANDARD': return 'border-blue-200 hover:border-blue-400'
      case 'PREMIUM': return 'border-amber-200 hover:border-amber-400 ring-2 ring-amber-100'
      default: return 'border-gray-200'
    }
  }

  if (loading) {
    return <div className="py-20 text-center">Loading...</div>
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#2B5A8E] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-[#F59E0B]/20 text-[#FCD34D] px-4 py-2 rounded-full text-sm font-medium mb-6">
            Nos Services
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 max-w-4xl">
            Des expertises au service de votre performance
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Quatre domaines d&apos;intervention complémentaires pour une transformation globale de votre entreprise.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {services.map((service: any, index: number) => {
            const isExpanded = selectedService?.id === service.id
            const showTiers = !selectedTier || selectedTier.serviceId !== service.id

            return (
              <div key={service.id}>
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    {service.logo && (
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                        <img src={service.logo} alt={service.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    {service.category && (
                      <div className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium mb-2">
                        {service.category}
                      </div>
                    )}
                    <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                      {service.name}
                    </h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <button 
                      onClick={() => {
                        if (isExpanded) {
                          resetBooking()
                        } else {
                          setSelectedService(service)
                          setSelectedTier(null)
                          setSuccessOrder(null)
                        }
                      }}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                        isExpanded 
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                          : 'bg-[#2B5A8E] text-white hover:bg-[#234a73]'
                      }`}
                    >
                      {isExpanded ? 'Masquer les formules' : 'Voir les formules'}
                      <svg className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  <div className={`bg-gray-200 rounded-2xl h-80 flex items-center justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    {service.logo ? (
                      <img src={service.logo} alt={service.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <div className="text-8xl opacity-20">📊</div>
                    )}
                  </div>
                </div>

                {/* Step 1: Tiers Selection */}
                {isExpanded && showTiers && service.tiers && (
                  <div className="mt-10">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold mb-3">
                        <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                        ÉTAPE 1
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Choisissez votre formule</h3>
                      <p className="text-gray-500 text-sm">Sélectionnez le plan qui correspond à vos besoins</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                      {service.tiers.map((tier: any) => (
                        <div 
                          key={tier.id} 
                          className={`relative bg-white rounded-2xl border-2 ${getTierBorder(tier.tierType)} p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col`}
                        >
                          {tier.tierType === 'PREMIUM' && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                              Populaire
                            </div>
                          )}
                          <div className={`bg-gradient-to-r ${getTierColor(tier.tierType)} text-white rounded-xl p-4 mb-5 text-center`}>
                            <div className="text-3xl mb-1">{getTierIcon(tier.tierType)}</div>
                            <h4 className="text-lg font-bold">{tier.tierType}</h4>
                          </div>
                          <div className="text-center mb-5">
                            <span className="text-4xl font-black text-gray-900">{Number(tier.price).toFixed(0)}</span>
                            <span className="text-lg text-gray-500 ml-1">€</span>
                            {tier.description && <p className="text-xs text-gray-400 mt-2">{tier.description}</p>}
                          </div>
                          <div className="space-y-3 mb-6 flex-1">
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              </div>
                              <span className="text-gray-700">{tier.maxMessages ? `${tier.maxMessages} messages` : 'Messages illimités'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              </div>
                              <span className="text-gray-700">{tier.maxCallDuration ? `${tier.maxCallDuration} min d'appels` : 'Appels illimités'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <div className={`w-6 h-6 ${tier.canSelectConsultant ? 'bg-green-100' : 'bg-gray-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
                                {tier.canSelectConsultant ? (
                                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                )}
                              </div>
                              <span className={tier.canSelectConsultant ? 'text-gray-700' : 'text-gray-400'}>Choix du consultant</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleTierSelect(service, tier)}
                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                              tier.tierType === 'PREMIUM'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl'
                                : 'bg-[#2B5A8E] hover:bg-[#234a73] text-white'
                            }`}
                          >
                            {isLoggedIn ? 'Choisir cette formule →' : 'Se connecter pour souscrire'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Consultant & Schedule Selection */}
                {isExpanded && selectedTier && selectedTier.serviceId === service.id && !successOrder && (
                  <div className="mt-10">
                    {/* Recap */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-8 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`bg-gradient-to-r ${getTierColor(selectedTier.tierType)} text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl`}>
                          {getTierIcon(selectedTier.tierType)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-500">{selectedTier.tierType} — {Number(selectedTier.price).toFixed(0)}€</div>
                        </div>
                      </div>
                      <button onClick={() => { setSelectedTier(null); setSelectedConsultant(''); setSelectedDate(null); setSelectedStartHour(null) }} className="text-sm text-blue-600 hover:underline font-medium">
                        ← Changer de formule
                      </button>
                    </div>

                    <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold mb-3">
                        <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                        ÉTAPE 2
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Sélectionnez votre créneau</h3>
                      <p className="text-gray-500 text-sm">Choisissez un consultant et un créneau disponible</p>
                    </div>

                    {/* Duration */}
                    <div className="mb-6 flex items-center justify-center gap-4">
                      <label className="font-semibold text-gray-700">Durée :</label>
                      <select 
                        value={selectedDuration} 
                        onChange={e => setSelectedDuration(parseInt(e.target.value))}
                        className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="1">1 heure</option>
                        <option value="2">2 heures</option>
                        <option value="3">3 heures</option>
                        <option value="4">4 heures</option>
                      </select>
                    </div>

                    {loadingConsultants ? (
                      <div className="text-center py-12 text-gray-500">Chargement des consultants...</div>
                    ) : consultants.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">Aucun consultant disponible pour ce service.</div>
                    ) : (
                      <div className="space-y-8">
                        {consultants.map(consultant => (
                          <div key={consultant.id} className="bg-white border-2 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold mb-1 text-[#2B5A8E]">{consultant.name}</h3>
                            {consultant.specialty && <p className="text-sm text-gray-500 mb-4">{consultant.specialty}</p>}
                            
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-gradient-to-r from-[#2B5A8E] to-blue-600 text-white">
                                    <th className="border border-blue-400 p-3 text-left font-semibold text-sm">Date</th>
                                    {hours.map(h => (
                                      <th key={h} className="border border-blue-400 p-3 text-center font-semibold text-sm">{h}h</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {dates.map(date => (
                                    <tr key={date.toISOString()} className="hover:bg-gray-50">
                                      <td className="border border-gray-200 p-3 font-medium bg-gray-50">
                                        <div className="text-sm">{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                                        <div className="text-xs text-gray-500">{date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                                      </td>
                                      {hours.map(hour => {
                                        const blocked = isSlotBlocked(consultant.id, date, hour)
                                        const isPast = new Date(date).setHours(hour) < new Date().getTime()
                                        const isSelected = selectedConsultant === consultant.id && 
                                                          selectedDate?.getDate() === date.getDate() && 
                                                          selectedStartHour === hour
                                        const isDisabled = blocked || isPast

                                        return (
                                          <td
                                            key={hour}
                                            onClick={() => {
                                              if (!isDisabled) {
                                                setSelectedConsultant(consultant.id)
                                                setSelectedDate(date)
                                                setSelectedStartHour(hour)
                                              }
                                            }}
                                            className={`border border-gray-200 p-2 text-center text-sm font-medium transition-all ${
                                              isDisabled 
                                                ? 'bg-red-50 text-red-300 cursor-not-allowed' 
                                                : isSelected 
                                                ? 'bg-green-500 text-white shadow-md scale-105 cursor-pointer ring-2 ring-green-300' 
                                                : 'bg-green-50 hover:bg-green-100 cursor-pointer hover:shadow-sm'
                                            }`}
                                          >
                                            {isDisabled ? '✕' : isSelected ? '✓' : '○'}
                                          </td>
                                        )
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sticky Confirm Bar */}
                    {selectedConsultant && selectedDate && selectedStartHour !== null && (
                      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-green-500 p-4 shadow-2xl z-40">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                          <div className="text-sm">
                            <span className="font-bold text-gray-900">Récapitulatif : </span>
                            <span className="text-gray-600">
                              {service.name} ({selectedTier.tierType}) · {consultants.find(c => c.id === selectedConsultant)?.name} · {selectedDate.toLocaleDateString('fr-FR')} de {selectedStartHour}h à {selectedStartHour + selectedDuration}h
                            </span>
                          </div>
                          <button
                            onClick={handlePurchase}
                            disabled={submitting}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                          >
                            {submitting ? 'Création...' : 'Confirmer la réservation'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Success State */}
                {isExpanded && successOrder && (
                  <div className="mt-10 max-w-lg mx-auto text-center bg-white rounded-2xl border-2 border-green-200 p-10 shadow-lg">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Commande créée avec succès !</h3>
                    <p className="text-gray-500 mb-6">Votre réservation est en attente de confirmation par le consultant.</p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => router.push(`/client/orders/${successOrder.order.id}`)}
                        className="bg-[#2B5A8E] hover:bg-[#234a73] text-white px-6 py-3 rounded-xl font-bold transition-all"
                      >
                        Voir ma commande
                      </button>
                      <button
                        onClick={resetBooking}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold transition-all"
                      >
                        Retour aux services
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              NOTRE MÉTHODOLOGIE
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
              Un processus éprouvé en 4 étapes
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: 1, icon: '🎯', title: 'Diagnostic', description: 'Audit complet de votre organisation et identification des axes d\'amélioration.' },
              { number: 2, icon: '📋', title: 'Plan d\'action', description: 'Élaboration d\'un plan d\'action personnalisé avec des objectifs mesurables.' },
              { number: 3, icon: '🎓', title: 'Accompagnement', description: 'Mise en œuvre, formation des équipes et transfert de compétences.' },
              { number: 4, icon: '📊', title: 'Suivi & Mesure', description: 'Pilotage des résultats et ajustements pour garantir la pérennité.' }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-50 rounded-full text-4xl mb-6 border-4 border-white shadow-sm">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#2B5A8E] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Besoin d&apos;un accompagnement personnalisé ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Contactez-nous pour un diagnostic gratuit de votre organisation.
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            Réserver un créneau
          </Link>
        </div>
      </section>

      {/* Payment Modal */}
      {showPaymentModal && paymentTier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className={`transition-all duration-500 ${paymentSuccess ? 'bg-green-500' : 'bg-[#2B5A8E]'} p-6 text-white`}>
              {paymentSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">Paiement Réussi !</h2>
                  <p className="text-green-100 mt-2">Redirection vers le calendrier...</p>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">Paiement Sécurisé</h2>
                    <p className="text-blue-100 text-sm mt-1">Formule {paymentTier.tierType} — {Number(paymentTier.price).toFixed(0)}€</p>
                  </div>
                  <button onClick={() => setShowPaymentModal(false)} className="text-white/70 hover:text-white text-2xl font-bold leading-none">&times;</button>
                </div>
              )}
            </div>

            {!paymentSuccess && (
              <form onSubmit={handlePayment} className="p-6">
                <div className="mb-6">
                  {/* Credit Card Graphic */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="w-10 h-8 bg-yellow-400/80 rounded flex items-center justify-center">
                        <div className="w-6 h-4 border border-yellow-500/50 rounded-sm"></div>
                      </div>
                      <div className="text-xl">{cardNumber ? getCardBrand(cardNumber)?.icon || '💳' : '💳'}</div>
                    </div>
                    <div className="text-lg tracking-[0.2em] font-mono mb-4 min-h-[1.5rem] opacity-90">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 font-mono">
                      <div className="uppercase tracking-wider truncate max-w-[150px]">{cardName || 'NOM SUR LA CARTE'}</div>
                      <div>{cardExpiry || 'MM/YY'}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5 flex justify-between">
                      <span>Numéro de carte</span>
                      <span className={`font-medium ${getCardBrand(cardNumber)?.color || 'text-gray-400'}`}>
                        {getCardBrand(cardNumber)?.name || ''}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Expiration</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">CVC</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="123"
                        maxLength={3}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Nom sur la carte</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={e => setCardName(e.target.value.toUpperCase())}
                      placeholder="Votre nom"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={paymentProcessing}
                    className="w-full bg-[#2B5A8E] hover:bg-[#234a73] disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all mt-4 relative overflow-hidden group"
                  >
                    {paymentProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Traitement en cours...
                      </span>
                    ) : (
                      <>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Payer {Number(paymentTier.price).toFixed(0)}€
                        </span>
                        <div className="absolute inset-0 h-full w-full bg-blue-600 border-t-2 border-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1 mt-2">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Paiement 100% sécurisé (Test Mode)
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowAuthModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#2B5A8E] to-blue-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">
                    {authTab === 'login' ? 'Connexion' : 'Créer un compte'}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Connectez-vous pour réserver votre créneau
                  </p>
                </div>
                <button onClick={() => setShowAuthModal(false)} className="text-white/70 hover:text-white text-2xl font-bold leading-none">&times;</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => { setAuthTab('login'); setAuthError('') }}
                className={`flex-1 py-3 text-sm font-bold transition-all ${authTab === 'login' ? 'text-[#2B5A8E] border-b-2 border-[#2B5A8E] bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Se connecter
              </button>
              <button
                onClick={() => { setAuthTab('register'); setAuthError('') }}
                className={`flex-1 py-3 text-sm font-bold transition-all ${authTab === 'register' ? 'text-[#2B5A8E] border-b-2 border-[#2B5A8E] bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Créer un compte
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="p-6 space-y-4">
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {authError}
                </div>
              )}

              {authTab === 'register' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Nom complet</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={e => setAuthName(e.target.value)}
                    placeholder="Votre nom"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Mot de passe</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#2B5A8E] hover:bg-[#234a73] disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all text-sm"
              >
                {authLoading 
                  ? 'Chargement...' 
                  : authTab === 'login' 
                    ? 'Se connecter' 
                    : 'Créer mon compte'
                }
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                {authTab === 'login' 
                  ? 'Pas encore de compte ? ' 
                  : 'Déjà un compte ? '
                }
                <button
                  type="button"
                  onClick={() => { setAuthTab(authTab === 'login' ? 'register' : 'login'); setAuthError('') }}
                  className="text-[#2B5A8E] font-bold hover:underline"
                >
                  {authTab === 'login' ? 'Créer un compte' : 'Se connecter'}
                </button>
              </p>

              {/* Selected tier recap */}
              {pendingTier && pendingService && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Formule sélectionnée</div>
                  <div className="text-sm font-bold text-gray-900">{pendingService.name} — {pendingTier.tierType}</div>
                  <div className="text-xs text-gray-500">{Number(pendingTier.price).toFixed(0)}€</div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
