'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

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

export default function ServicesPage() {
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('serviceId')
  
  const [step, setStep] = useState(serviceId ? 2 : 1)
  const [services, setServices] = useState<Service[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedTier, setSelectedTier] = useState<ServiceTier | null>(null)
  const [selectedConsultant, setSelectedConsultant] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null)
  const [selectedEndHour, setSelectedEndHour] = useState<number | null>(null)
  const [successOrder, setSuccessOrder] = useState<any>(null)
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

  const navigateSchedule = (days: number) => {
    const newDate = new Date(scheduleStartDate)
    newDate.setDate(newDate.getDate() + days)
    
    // Prevent going before today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (newDate < today) {
      setScheduleStartDate(today)
    } else {
      setScheduleStartDate(newDate)
    }
  }

  useEffect(() => {
    fetch('/api/services/with-tiers').then(r => r.json()).then(data => {
      setServices(data)
      if (serviceId) {
        const service = data.find((s: Service) => s.id === serviceId)
        if (service) setSelectedService(service)
      }
    })
  }, [serviceId])

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
      setPaymentProcessing(true) // Should be false but following solutions page pattern
      setPaymentProcessing(false)
      setPaymentSuccess(true)

      // After success animation, proceed to booking
      setTimeout(() => {
        setShowPaymentModal(false)
        setIsPaid(true)
        setStep(3) // Proceed to calendar
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
      alert('Commande créée avec succès!')
      setStep(1)
      setSelectedService(null)
      setSelectedTier(null)
      setSelectedConsultant('')
      setSelectedDate(null)
      setSelectedStartHour(null)
      setSelectedEndHour(null)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Nos Services</h1>

      {step === 3 && consultants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg">Chargement des consultants...</p>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4">
          {services.map(service => (
            <div key={service.id} className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <button
                onClick={() => {
                  setSelectedService(service)
                  setStep(2)
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Choisir
              </button>
            </div>
          ))}
        </div>
      )}

      {step === 2 && selectedService && (
        <div>
          <button onClick={() => setStep(1)} className="mb-4 text-blue-600">← Retour</button>
          <h2 className="text-2xl font-semibold mb-4">{selectedService.name}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {selectedService.tiers.map(tier => (
              <div key={tier.id} className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">{tier.name}</h3>
                <p className="text-3xl font-bold mb-4">{tier.price}€</p>
                <p className="text-sm text-gray-600 mb-2">{tier.messageLimit} messages</p>
                <p className="text-sm text-gray-600 mb-4">{tier.callLimit} appels</p>
                <button
                  onClick={() => {
                    setSelectedTier(tier)
                    setShowMeetingModal(true) // Show meeting type first
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Continuer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && consultants.length > 0 && (
        <div>
          <button onClick={() => setStep(2)} className="mb-6 text-blue-600 hover:underline">← Retour</button>
          <h2 className="text-2xl font-bold mb-4">Sélectionnez votre créneau</h2>
          
          <div className="flex flex-col items-center gap-6 mb-10">
            {/* Quick Navigation Controls */}
            <div className="flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200 shadow-inner">
              <button 
                onClick={() => navigateSchedule(-1)}
                disabled={scheduleStartDate <= new Date(new Date().setHours(0,0,0,0))}
                className="px-4 py-2 font-bold text-xs uppercase tracking-widest text-gray-500 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all disabled:opacity-30"
              >
                Jour
              </button>
              <button 
                onClick={() => navigateSchedule(-7)}
                disabled={scheduleStartDate <= new Date(new Date().setHours(0,0,0,0))}
                className="px-4 py-2 font-bold text-xs uppercase tracking-widest text-blue-600 bg-white shadow-sm rounded-xl transition-all disabled:opacity-30"
              >
                Semaine
              </button>
              <button 
                onClick={() => {
                  const nextMonth = new Date(scheduleStartDate)
                  nextMonth.setMonth(nextMonth.getMonth() + 1)
                  setScheduleStartDate(nextMonth)
                }}
                className="px-4 py-2 font-bold text-xs uppercase tracking-widest text-gray-500 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
              >
                Mois
              </button>
            </div>

            {/* Main Date Display & Arrows */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigateSchedule(-7)}
                disabled={scheduleStartDate <= new Date(new Date().setHours(0,0,0,0))}
                className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-100 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-600 hover:shadow-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
              >
                <svg className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full group-hover:bg-blue-500/10 transition-colors"></div>
                <div className="relative flex flex-col items-center px-10 py-4 bg-white border-2 border-blue-600/10 rounded-[2rem] shadow-[0_10px_40px_rgba(37,99,235,0.08)] min-w-[280px]">
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Période de Consultation</div>
                  <div className="text-2xl font-serif font-black text-gray-900 flex items-center gap-3">
                    <span className="text-gray-400 text-lg font-sans">📅</span>
                    {(() => {
                      const endDate = new Date(scheduleStartDate)
                      endDate.setDate(endDate.getDate() + 6)
                      const startStr = scheduleStartDate.toLocaleDateString('fr-FR', { day: 'numeric' })
                      const endStr = endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                      if (scheduleStartDate.getMonth() !== endDate.getMonth()) {
                        const startMonth = scheduleStartDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                        return `${startMonth} — ${endStr}`
                      }
                      return `${startStr} — ${endStr}`
                    })()}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigateSchedule(7)}
                className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-100 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-600 hover:shadow-lg transition-all group"
              >
                <svg className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid gap-8">
            {Array.isArray(consultants) && consultants.map(consultant => (
              <div key={consultant.id} className="border-2 rounded-xl p-6 shadow-lg bg-white">
                <h3 className="text-xl font-bold mb-4 text-blue-600">{consultant.name}</h3>
                
                <div className="overflow-x-auto">
                <table className="w-full border-collapse" onMouseLeave={() => setIsDragging(false)}>
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <th className="border border-blue-400 p-3 text-left font-semibold">Date</th>
                        {hours.map(h => (
                          <th key={h} className="border border-blue-400 p-3 text-center font-semibold text-sm">
                            {h}h
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dates.map(date => (
                        <tr key={date.toISOString()} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                            <div className="text-sm">{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                            <div className="text-xs text-gray-600">{date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                          </td>
                          {hours.map(hour => {
                            const blocked = isSlotBlocked(consultant.id, date, hour, 1)
                            const isStart = selectedConsultant === consultant.id &&
                              selectedDate?.toDateString() === date.toDateString() &&
                              selectedStartHour === hour
                            const isInRange = selectedConsultant === consultant.id &&
                              selectedDate?.toDateString() === date.toDateString() &&
                              selectedStartHour !== null && selectedEndHour !== null &&
                              hour >= selectedStartHour && hour < selectedEndHour

                            return (
                              <td
                                key={hour}
                                onMouseDown={() => {
                                  if (blocked) return
                                  setSelectedConsultant(consultant.id)
                                  setSelectedDate(date)
                                  setSelectedStartHour(hour)
                                  setSelectedEndHour(hour + 1)
                                  setIsDragging(true)
                                }}
                                onMouseEnter={() => {
                                  if (isDragging && selectedConsultant === consultant.id && selectedDate?.toDateString() === date.toDateString() && selectedStartHour !== null && hour >= selectedStartHour) {
                                    setSelectedEndHour(hour + 1)
                                  }
                                }}
                                onMouseUp={() => setIsDragging(false)}
                                className={`border border-gray-300 p-2 text-center text-sm font-medium transition-all select-none ${
                                  blocked
                                    ? 'bg-red-100 text-red-700 cursor-not-allowed'
                                    : isInRange
                                    ? 'bg-green-500 text-white cursor-pointer'
                                    : 'bg-green-50 hover:bg-green-200 cursor-pointer'
                                }`}
                              >
                                {blocked ? '✕' : isInRange ? (isStart ? '▶' : '—') : '○'}
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

          {selectedConsultant && selectedDate && selectedStartHour !== null && selectedEndHour !== null && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-green-500 p-4 shadow-2xl">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-semibold">Sélection:</span> {consultants.find(c => c.id === selectedConsultant)?.name} - {selectedDate.toLocaleDateString('fr-FR')} de {selectedStartHour}h à {selectedEndHour}h ({selectedEndHour - selectedStartHour}h)
                </div>
                <button
                  onClick={() => setShowMeetingModal(true)}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Confirmer la réservation
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Meeting Type Popup */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowMeetingModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Type de réunion</h2>
            <p className="text-sm text-gray-500 mb-6">
              {selectedDate?.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {selectedStartHour}h – {selectedEndHour}h
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setSelectedMeetingType('ZOOM')
                  setShowMeetingModal(false)
                  setShowPaymentModal(true)
                }}
                className="flex flex-col items-center gap-3 p-5 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <span className="text-3xl">🎥</span>
                <span className="font-bold text-gray-800 group-hover:text-blue-700">Zoom</span>
                <span className="text-xs text-gray-400 text-center">Réunion en ligne</span>
              </button>
              <button
                onClick={() => {
                  setSelectedMeetingType('SUR_PLACE')
                  setShowMeetingModal(false)
                  setShowPaymentModal(true)
                }}
                className="flex flex-col items-center gap-3 p-5 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <span className="text-3xl">🏢</span>
                <span className="font-bold text-gray-800 group-hover:text-green-700">Sur Place</span>
                <span className="text-xs text-gray-400 text-center">Réunion physique</span>
              </button>
            </div>
            <button onClick={() => setShowMeetingModal(false)} className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600">Annuler</button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedTier && (
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
                    <p className="text-blue-100 text-sm mt-1">Formule {selectedTier.name} — {Number(selectedTier.price).toFixed(0)}€</p>
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
                          Payer {Number(selectedTier.price).toFixed(0)}€
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
    </div>
  )
}
