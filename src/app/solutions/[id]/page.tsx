'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ServiceTier {
  id: string
  name: string
  price: number
  messageLimit: number
  callLimit: number
}

interface Service {
  id: string
  name: string
  description: string
  tiers: ServiceTier[]
}

interface Reservation {
  id: string
  startTime: string
  endTime: string
}

interface Consultant {
  id: string
  name: string
  reservations: Reservation[]
}

export default function SolutionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id: serviceId } = params
  
  const [step, setStep] = useState(2) // Start at tier selection
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedTier, setSelectedTier] = useState<ServiceTier | null>(null)
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [selectedConsultant, setSelectedConsultant] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null)
  const [selectedEndHour, setSelectedEndHour] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showMeetingModal, setShowMeetingModal] = useState(false)

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardName, setCardName] = useState('')
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [selectedMeetingType, setSelectedMeetingType] = useState<'ZOOM' | 'SUR_PLACE' | null>(null)

  // Schedule Navigation state
  const [scheduleStartDate, setScheduleStartDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  useEffect(() => {
    setLoading(true)
    fetch('/api/services/with-tiers')
      .then(r => r.json())
      .then(data => {
        const service = data.find((s: Service) => s.id === serviceId)
        if (service) {
          setSelectedService(service)
        } else {
          // If service not found, maybe redirect to main solutions page
          router.push('/solutions')
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [serviceId, router])

  useEffect(() => {
    if (step === 3 && selectedTier) {
      const startDateStr = scheduleStartDate.toISOString().split('T')[0]
      const fetchUrl = `/api/consultants/schedule?startDate=${startDateStr}&days=7&serviceTierId=${selectedTier.id}`
      fetch(fetchUrl)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setConsultants(data)
          } else {
            setConsultants([])
          }
        })
        .catch(() => {
          setConsultants([])
        })
    }
  }, [step, scheduleStartDate, selectedTier])

  const hours = Array.from({ length: 9 }, (_, i) => i + 9)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(scheduleStartDate)
    d.setDate(d.getDate() + i)
    return d
  })

  // Helpers
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

  const navigateSchedule = (days: number) => {
    const newDate = new Date(scheduleStartDate)
    newDate.setDate(newDate.getDate() + days)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (newDate < today) {
      setScheduleStartDate(today)
    } else {
      setScheduleStartDate(newDate)
    }
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
    setTimeout(() => {
      setPaymentProcessing(false)
      setPaymentSuccess(true)
      setTimeout(() => {
        setShowPaymentModal(false)
        setIsPaid(true)
        setStep(3)
      }, 1500)
    }, 2000)
  }

  const isSlotBlocked = (consultantId: string, date: Date, hour: number, duration: number = 1) => {
    const consultant = consultants.find(c => c.id === consultantId)
    if (!consultant) return false
    const slotStart = new Date(date)
    slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = new Date(slotStart)
    slotEnd.setHours(hour + duration, 0, 0, 0)
    return consultant.reservations.some(r => {
      const resStart = new Date(r.startTime)
      const resEnd = new Date(r.endTime)
      return (slotStart < resEnd && slotEnd > resStart)
    })
  }

  const handlePurchase = async () => {
    if (!selectedTier || !selectedConsultant || !selectedDate || selectedStartHour === null || selectedEndHour === null) return
    const startTime = new Date(selectedDate)
    startTime.setHours(selectedStartHour, 0, 0, 0)
    const endTime = new Date(startTime)
    endTime.setHours(selectedEndHour, 0, 0, 0)

    const res = await fetch('/api/client/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceTierId: selectedTier.id,
        consultantId: selectedConsultant,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        meetingType: selectedMeetingType ?? 'ZOOM'
      })
    })

    if (res.ok) {
      setShowMeetingModal(false)
      alert('Commande créée avec succès !')
      router.push('/client/orders') // Redirect to orders after success
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Chargement de votre solution...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header Section */}
      <div className="bg-[#2B5A8E] text-white py-12 mb-8 shadow-inner">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-1 w-12 bg-amber-400 rounded-full"></div>
            <span className="text-amber-400 font-bold tracking-widest text-xs uppercase">Solution Expert</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            {selectedService?.name}
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            {selectedService?.description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {step === 2 && selectedService && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => router.push('/solutions')} 
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors group"
              >
                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </div>
                Toutes nos solutions
              </button>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                ÉVALUATION DE VOS BESOINS
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {selectedService.tiers.map((tier: any) => (
                <div 
                  key={tier.id} 
                  className={`relative bg-white rounded-[2.5rem] border-2 ${getTierBorder(tier.tierType || tier.name)} p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group`}
                >
                  {(tier.tierType === 'PREMIUM' || tier.name?.toLowerCase().includes('premium')) && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-1.5 rounded-full shadow-lg border-2 border-white">
                      Populaire
                    </div>
                  )}
                  <div className={`bg-gradient-to-br ${getTierColor(tier.tierType || tier.name)} text-white rounded-3xl p-6 mb-8 text-center shadow-lg transform group-hover:scale-105 transition-transform duration-500`}>
                    <div className="text-4xl mb-2">{getTierIcon(tier.tierType || tier.name)}</div>
                    <h4 className="text-xl font-bold uppercase tracking-wider">{tier.tierType || tier.name}</h4>
                  </div>
                  
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-5xl font-black text-gray-900 tracking-tight">{Number(tier.price).toFixed(0)}</span>
                      <span className="text-xl text-gray-400 font-bold self-start mt-2">€</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-600 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                      <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span>{tier.messageLimit || tier.maxMessages || 10} messages inclus</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-600 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                      <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span>{tier.callLimit || tier.maxCallDuration || 30} min d'appels</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTier(tier)
                      setShowMeetingModal(true)
                    }}
                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 ${
                      (tier.tierType === 'PREMIUM' || tier.name?.toLowerCase().includes('premium'))
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        : 'bg-[#2B5A8E] text-white hover:bg-[#1d3d61]'
                    }`}
                  >
                    Choisir cette offre →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setStep(2)} 
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors group"
              >
                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </div>
                Revenir aux formules
              </button>
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                PRISE DE RENDEZ-VOUS
              </div>
            </div>

            {consultants.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                   <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-xl text-gray-500 font-medium tracking-tight">Vérification de la disponibilité de nos experts...</p>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="text-center max-w-2xl mx-auto">
                  <h3 className="text-3xl font-serif font-black text-gray-900 mb-4">Sélectionnez votre créneau</h3>
                  <p className="text-gray-500 font-medium">Réservez dès maintenant votre première session stratégique.</p>
                </div>

                <div className="flex flex-col items-center gap-8 mb-12">
                   {/* Date Nav */}
                   <div className="flex items-center gap-6">
                    <button onClick={() => navigateSchedule(-7)} disabled={scheduleStartDate <= new Date(new Date().setHours(0,0,0,0))} className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-20 transition-all shadow-sm">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="bg-white px-8 py-4 rounded-2xl border border-gray-100 shadow-sm text-center min-w-[200px]">
                      <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Semaine du</div>
                       <div className="font-bold text-gray-900">{scheduleStartDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</div>
                    </div>
                    <button onClick={() => navigateSchedule(7)} className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>

                <div className="grid gap-8">
                  {consultants.map(consultant => (
                    <div key={consultant.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">{consultant.name.charAt(0)}</div>
                        <h4 className="text-xl font-bold">{consultant.name}</h4>
                      </div>
                      <div className="overflow-x-auto pb-4">
                        <table className="w-full border-collapse" onMouseLeave={() => setIsDragging(false)}>
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="p-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-tl-xl border-b border-gray-100 italic">Jour</th>
                              {hours.map(h => <th key={h} className="p-3 text-center text-[10px] font-black text-gray-400 uppercase border-b border-gray-100">{h}h</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {dates.map(date => (
                              <tr key={date.toISOString()}>
                                <td className="p-3 font-bold text-xs bg-gray-50/30 border-r border-gray-50">
                                  {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                                </td>
                                {hours.map(hour => {
                                  const blocked = isSlotBlocked(consultant.id, date, hour)
                                  const isPast = new Date(date).setHours(hour) < new Date().getTime()
                                  const isDisabled = blocked || isPast
                                  const isSelected = selectedConsultant === consultant.id && selectedDate?.toDateString() === date.toDateString() && hour >= (selectedStartHour || 0) && hour < (selectedEndHour || 0)
                                  
                                  return (
                                    <td key={hour}
                                      onMouseDown={() => { if (!isDisabled) { setSelectedConsultant(consultant.id); setSelectedDate(date); setSelectedStartHour(hour); setSelectedEndHour(hour + 1); setIsDragging(true) } }}
                                      onMouseEnter={() => { if (isDragging && selectedConsultant === consultant.id && selectedDate?.toDateString() === date.toDateString() && hour >= (selectedStartHour || 0)) setSelectedEndHour(hour + 1) }}
                                      onMouseUp={() => setIsDragging(false)}
                                      className={`p-3 text-center border-b border-r border-gray-50 cursor-pointer transition-all ${isDisabled ? 'bg-gray-50 text-gray-200 cursor-not-allowed' : isSelected ? 'bg-blue-600 text-white shadow-inner font-bold' : 'hover:bg-blue-50'}`}
                                    >
                                      {isDisabled ? '—' : isSelected ? '✓' : ''}
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

                {selectedConsultant && selectedDate && selectedStartHour !== null && (
                  <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-40">
                    <div className="bg-[#2B5A8E] text-white p-6 rounded-[2rem] shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md">
                      <div>
                        <div className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Créneau sélectionné</div>
                        <div className="font-bold">{selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })} à {selectedStartHour}h</div>
                      </div>
                      <button onClick={() => setShowMeetingModal(true)} className="bg-white text-blue-900 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-colors">Confirmer</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Meeting Type Popup */}
        {showMeetingModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md mx-4 p-10 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">Type de réunion</h2>
              <p className="text-gray-500 text-center mb-8">Comment souhaitez-vous échanger ?</p>
              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => { setSelectedMeetingType('ZOOM'); setShowMeetingModal(false); setShowPaymentModal(true) }} className="flex items-center gap-4 p-5 border-2 border-gray-100 rounded-2xl hover:border-blue-600 transition-all font-bold text-gray-700">
                  <span className="text-2xl">🎥</span> Visioconférence Zoom
                </button>
                <button onClick={() => { setSelectedMeetingType('SUR_PLACE'); setShowMeetingModal(false); setShowPaymentModal(true) }} className="flex items-center gap-4 p-5 border-2 border-gray-100 rounded-2xl hover:border-green-600 transition-all font-bold text-gray-700">
                  <span className="text-2xl">🏢</span> Rencontre sur place
                </button>
              </div>
              <button onClick={() => setShowMeetingModal(false)} className="mt-6 w-full text-xs font-black text-gray-400 hover:text-gray-900 tracking-widest uppercase">Annuler</button>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedTier && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-50 animate-in fade-in duration-500 overflow-y-auto py-10">
            <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-white">
               <div className={`p-10 text-white text-center ${paymentSuccess ? 'bg-green-600' : 'bg-[#2B5A8E]'}`}>
                  {paymentSuccess ? (
                    <div>
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-xl">✅</div>
                      <h2 className="text-2xl font-black">Paiement Accepté</h2>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-3xl font-black mb-2">{Number(selectedTier.price).toFixed(0)}€</h2>
                      <p className="text-blue-100 opacity-80 uppercase tracking-widest text-xs font-bold">{selectedTier.name}</p>
                    </div>
                  )}
               </div>
               
               {!paymentSuccess && (
                 <form onSubmit={handlePayment} className="p-10 space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                       <div className="text-lg font-mono tracking-widest mb-4">{cardNumber || '•••• •••• •••• ••••'}</div>
                       <div className="flex justify-between text-[10px] uppercase font-bold opacity-60">
                          <span>{cardName || 'NOM PRENOM'}</span>
                          <span>{cardExpiry || 'MM/YY'}</span>
                       </div>
                    </div>
                    <div className="space-y-4">
                      <input type="text" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} placeholder="N° de Carte" className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 outline-none focus:border-blue-500 font-mono" required />
                      <div className="flex gap-4">
                        <input type="text" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" className="w-1/2 bg-gray-50 border-2 border-gray-100 rounded-xl p-4 outline-none focus:border-blue-500" required />
                        <input type="text" value={cardCvc} onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="CVC" className="w-1/2 bg-gray-50 border-2 border-gray-100 rounded-xl p-4 outline-none focus:border-blue-500" required />
                      </div>
                      <input type="text" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} placeholder="NOM COMPLET" className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 outline-none focus:border-blue-500 uppercase font-black text-xs tracking-widest" required />
                    </div>
                    <button type="submit" disabled={paymentProcessing} className="w-full bg-[#2B5A8E] text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:shadow-2xl transition-all">
                       {paymentProcessing ? 'Traitement...' : 'Payer Maintenant'}
                    </button>
                 </form>
               )}
            </div>
          </div>
        )}

        {/* Completion Step - After Payment */}
        {isPaid && step === 3 && (
           <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
              <div className="w-32 h-32 bg-green-50 rounded-[2.5rem] flex items-center justify-center text-6xl mb-8 animate-bounce">🎊</div>
              <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Félicitations !</h2>
              <p className="text-xl text-gray-500 max-w-md mb-12">Votre solution est activée. Vous allez être redirigé vers votre espace personnel.</p>
              <button 
                onClick={handlePurchase}
                className="bg-[#2B5A8E] text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-900 transition-all"
              >
                Accéder à mes missions →
              </button>
           </div>
        )}
      </div>
    </div>
  )
}
