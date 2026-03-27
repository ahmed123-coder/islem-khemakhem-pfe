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

  // Fetch consultants when a tier is selected
  useEffect(() => {
    if (selectedTier) {
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
  }, [selectedTier])

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
      router.push(`/login?redirect=/services`)
      return
    }
    setSelectedService(service)
    setSelectedTier(tier)
    setSelectedConsultant('')
    setSelectedDate(null)
    setSelectedStartHour(null)
    setSuccessOrder(null)
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
    </div>
  )
}
