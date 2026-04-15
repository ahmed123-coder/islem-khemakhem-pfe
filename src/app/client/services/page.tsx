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
  const [loading, setLoading] = useState(true)

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
    setLoading(true)
    fetch('/api/services/with-tiers').then(r => r.json()).then(data => {
      setServices(data)
      if (serviceId) {
        const service = data.find((s: Service) => s.id === serviceId)
        if (service) setSelectedService(service)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Chargement...</p>
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
            <span className="text-amber-400 font-bold tracking-widest text-xs uppercase">Espace Client</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            {step === 1 ? 'Nos Services' : selectedService?.name}
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            {step === 1 
              ? 'Choisissez l\'expertise dont vous avez besoin pour propulser votre activité.' 
              : selectedService?.description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {step === 3 && consultants.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-200 shadow-sm">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl text-gray-500 font-medium">Recherche de consultants disponibles...</p>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
              <div key={service.id} className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 shadow-sm">
                  <span className="text-3xl">🎯</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{service.name}</h2>
                <p className="text-gray-600 mb-8 line-clamp-3 leading-relaxed">
                  {service.description}
                </p>
                <button
                  onClick={() => {
                    setSelectedService(service)
                    setStep(2)
                  }}
                  className="w-full bg-gray-50 text-blue-600 font-bold py-4 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                >
                  Choisir ce service
                  <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {step === 2 && selectedService && (
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setStep(1)} 
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors group"
              >
                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </div>
                Retour aux services
              </button>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                SÉLECTION DE LA FORMULE
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
                    {tier.description && <p className="text-sm text-gray-400 mt-3 font-medium">{tier.description}</p>}
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-600 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                      <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span>{tier.messageLimit || tier.maxMessages} messages inclus</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-600 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                      <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span>{tier.callLimit || tier.maxCallDuration} min d'appels</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-600 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                      <div className={`w-8 h-8 ${(tier.canSelectConsultant ?? true) ? 'bg-green-100' : 'bg-gray-100'} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        {(tier.canSelectConsultant ?? true) ? (
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                      </div>
                      <span className={(tier.canSelectConsultant ?? true) ? 'text-gray-600' : 'text-gray-400'}>Expert dédié au choix</span>
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
                    Sélectionner →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      {step === 3 && consultants.length > 0 && (
        <div className="space-y-12 animate-in fade-in duration-700">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setStep(2)} 
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors group"
            >
              <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </div>
              Changer de formule
            </button>
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
              <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">2</span>
              CHOIX DU CRÉNEAU
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-3xl font-serif font-black text-gray-900 mb-4">Sélectionnez votre créneau</h3>
            <p className="text-gray-500 font-medium tracking-wide">Cliquez et glissez sur les cellules pour réserver votre session avec nos experts.</p>
          </div>
          
          <div className="flex flex-col items-center gap-10 mb-16">
            {/* Quick Navigation Controls */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
              {[
                { label: 'Jour', value: -1 },
                { label: 'Semaine', value: -7 },
                { label: 'Mois', value: 30 }
              ].map((opt) => (
                <button 
                  key={opt.label}
                  onClick={() => opt.value === 30 ? setScheduleStartDate(new Date(new Date(scheduleStartDate).setMonth(scheduleStartDate.getMonth() + 1))) : navigateSchedule(opt.value)}
                  disabled={opt.value !== 30 && scheduleStartDate <= new Date(new Date().setHours(0,0,0,0))}
                  className={`px-6 py-2.5 font-black text-[10px] uppercase tracking-[0.15em] rounded-xl transition-all ${
                    opt.label === 'Semaine' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                  } disabled:opacity-20`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Main Date Display & Arrows */}
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigateSchedule(-7)}
                disabled={scheduleStartDate <= new Date(new Date().setHours(0,0,0,0))}
                className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-600 hover:shadow-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed group shadow-sm"
              >
                <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all duration-700"></div>
                <div className="relative flex flex-col items-center px-12 py-6 bg-white border border-blue-100 rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.08)] min-w-[320px]">
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] mb-2">Période disponible</div>
                  <div className="text-3xl font-serif font-black text-gray-900 flex items-center gap-4">
                    <span className="text-2xl">📅</span>
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
                className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-600 hover:shadow-xl transition-all group shadow-sm"
              >
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid gap-12">
            {Array.isArray(consultants) && consultants.map(consultant => (
              <div key={consultant.id} className="group bg-white border border-gray-100 rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_80px_rgba(0,0,0,0.08)] transition-all duration-700 overflow-hidden">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                    {consultant.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{consultant.name}</h3>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Expert Consultant</p>
                  </div>
                </div>
                
                <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-inner">
                  <table className="w-full border-collapse" onMouseLeave={() => setIsDragging(false)}>
                    <thead>
                      <tr className="bg-gray-50 text-gray-400 border-b border-gray-100">
                        <th className="p-5 text-left font-black text-[10px] uppercase tracking-widest bg-gray-50/50 sticky left-0 z-10 backdrop-blur-sm">Calendrier</th>
                        {hours.map(h => (
                          <th key={h} className="p-5 text-center font-black text-[10px] uppercase tracking-widest whitespace-nowrap min-w-[80px]">
                            {h}h:00
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dates.map(date => (
                        <tr key={date.toISOString()} className="group/row">
                          <td className="p-5 font-bold bg-gray-50/30 border-r border-gray-50 group-hover/row:bg-blue-50/30 transition-colors sticky left-0 z-10 backdrop-blur-sm">
                            <div className="text-xs text-gray-900 uppercase tracking-tighter">{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                            <div className="text-[10px] text-blue-500 font-black">{date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                          </td>
                          {hours.map(hour => {
                            const blocked = isSlotBlocked(consultant.id, date, hour, 1)
                            const isPast = new Date(date).setHours(hour) < new Date().getTime()
                            const isDisabled = blocked || isPast
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
                                  if (isDisabled) return
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
                                className={`p-4 text-center transition-all duration-300 select-none border-r border-b border-gray-50/50 ${
                                  isDisabled
                                    ? 'bg-gray-50/50 text-gray-200 cursor-not-allowed'
                                    : isInRange
                                    ? 'bg-blue-600 text-white shadow-lg z-10 scale-[1.02] rounded-md'
                                    : 'bg-white hover:bg-blue-50 group-hover/row:bg-blue-50/20 cursor-pointer'
                                }`}
                              >
                                {isDisabled ? '✕' : isInRange ? (isStart ? '▶' : '•') : (
                                  <div className="w-2 h-2 rounded-full bg-blue-100 mx-auto group-hover:scale-125 transition-transform"></div>
                                )}
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
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-40 animate-in slide-in-from-bottom-10 duration-500">
              <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_30px_60px_rgba(0,0,0,0.15)] p-6 rounded-[2rem] flex items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">
                    ✨
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Confirmation de séance</div>
                    <div className="font-bold text-gray-900">
                      {consultants.find(c => c.id === selectedConsultant)?.name} · {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      <span className="text-blue-600 ml-2">({selectedStartHour}h – {selectedEndHour}h)</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowMeetingModal(true)}
                  className="bg-[#2B5A8E] hover:bg-[#1d3d61] text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:scale-95"
                >
                  Confirmer et continuer
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
      {/* Meeting Type Popup */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300" onClick={() => setShowMeetingModal(false)}>
          <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.25)] w-full max-w-md mx-4 p-10 transform animate-in zoom-in-95 duration-300 border border-white" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <span className="text-4xl text-blue-600">🤝</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Type de réunion</h2>
              <p className="text-gray-500 font-medium">
                Comment souhaitez-vous échanger ?
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => {
                  setSelectedMeetingType('ZOOM')
                  setShowMeetingModal(false)
                  setShowPaymentModal(true)
                }}
                className="flex items-center gap-6 p-6 border-2 border-blue-100 rounded-[2rem] hover:border-blue-600 hover:bg-blue-50/50 transition-all group text-left shadow-sm hover:shadow-xl"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">🎥</div>
                <div className="flex-1">
                  <span className="block font-black text-gray-900 group-hover:text-blue-600 text-lg">Visioconférence Zoom</span>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Réunion à distance</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setSelectedMeetingType('SUR_PLACE')
                  setShowMeetingModal(false)
                  setShowPaymentModal(true)
                }}
                className="flex items-center gap-6 p-6 border-2 border-green-100 rounded-[2rem] hover:border-green-600 hover:bg-green-50/50 transition-all group text-left shadow-sm hover:shadow-xl"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">🏢</div>
                <div className="flex-1">
                  <span className="block font-black text-gray-900 group-hover:text-green-600 text-lg">Rencontre sur place</span>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Réunion physique</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>
            </div>
            
            <button onClick={() => setShowMeetingModal(false)} className="mt-8 w-full text-xs font-black text-gray-400 hover:text-gray-900 uppercase tracking-[0.2em] transition-colors">
              Annuler la demande
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedTier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-50 animate-in fade-in duration-500">
          <div className="bg-white rounded-[3rem] shadow-[0_50px_120px_rgba(0,0,0,0.3)] max-w-md w-full mx-4 overflow-hidden border border-white transform animate-in zoom-in-95 slide-in-from-bottom-10 duration-500" onClick={e => e.stopPropagation()}>
            <div className={`transition-all duration-700 ${paymentSuccess ? 'bg-green-600' : 'bg-[#2B5A8E]'} p-10 text-white relative overflow-hidden text-center`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              {paymentSuccess ? (
                <div className="relative z-10 animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-black mb-2">Paiement Réussi !</h2>
                  <p className="text-green-100 font-medium">Votre accès est activé. Redirection...</p>
                </div>
              ) : (
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-left">
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-2">Caisse Sécurisée</div>
                      <h2 className="text-3xl font-black tracking-tight">{Number(selectedTier.price).toFixed(0)}<span className="text-lg ml-0.5">€</span></h2>
                    </div>
                    <button onClick={() => setShowPaymentModal(false)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-xl font-bold">&times;</button>
                  </div>
                  <div className="flex items-center gap-4 bg-black/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm text-left">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">{getTierIcon(selectedTier.name)}</div>
                    <div>
                      <div className="font-bold uppercase text-sm tracking-widest">{selectedTier.name}</div>
                      <div className="text-[10px] font-medium opacity-70">Accès Premium aux services de conseil</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!paymentSuccess && (
              <form onSubmit={handlePayment} className="p-10">
                <div className="space-y-6">
                  {/* Digital Card Preview */}
                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden border border-white/20 transform hover:scale-105 transition-transform duration-500">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mb-16 blur-2xl"></div>
                    <div className="flex justify-between items-center mb-8">
                      <div className="w-12 h-9 bg-amber-400/90 rounded-lg shadow-inner flex items-center justify-center overflow-hidden">
                        <div className="w-10 h-6 border-y border-white/30"></div>
                      </div>
                      <div className="text-2xl font-bold opacity-80">{cardNumber ? getCardBrand(cardNumber)?.icon || '🔒' : '🔒'}</div>
                    </div>
                    <div className="text-xl tracking-[0.25em] font-mono mb-6 min-h-[1.75rem] text-center drop-shadow-md">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1">Détenteur</span>
                        <span className="text-xs font-bold uppercase tracking-widest truncate max-w-[140px]">{cardName || 'NOM PRENOM'}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1">Expiration</span>
                        <span className="text-xs font-mono font-bold">{cardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5">
                    <div className="relative">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Numéro de carte</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        required
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-mono transition-all outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Expiration</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-mono transition-all outline-none text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">CVC / CVV</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="***"
                          maxLength={3}
                          required
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-mono transition-all outline-none text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Nom sur la carte</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={e => setCardName(e.target.value.toUpperCase())}
                        placeholder="JEAN DUPONT"
                        required
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 uppercase transition-all outline-none font-bold tracking-wider"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={paymentProcessing}
                    className="w-full bg-[#2B5A8E] hover:bg-[#1d3d61] disabled:opacity-50 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all mt-4 relative overflow-hidden group shadow-xl hover:shadow-2xl active:scale-95"
                  >
                    {paymentProcessing ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sécurisation...
                      </span>
                    ) : (
                      <>
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Confirmer & Payer
                        </span>
                        <div className="absolute inset-0 h-full w-full bg-blue-600 border-t-2 border-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                      </>
                    )}
                  </button>
                  
                  <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
                    <img src="https://img.icons8.com/color/48/visa.png" className="h-6 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" />
                    <img src="https://img.icons8.com/color/48/mastercard.png" className="h-6 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" />
                    <div className="h-4 w-px bg-gray-200mx-2"></div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                       <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                       Secure 256-bit
                    </p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
