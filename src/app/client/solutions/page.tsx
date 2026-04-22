'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TierSelector from '@/components/solutions/TierSelector'
import AvailabilityCalendar from '@/components/solutions/AvailabilityCalendar'
import MeetingTypeModal from '@/components/solutions/MeetingTypeModal'
import PaymentModal from '@/components/solutions/PaymentModal'
import { toast } from 'react-hot-toast'

export default function ServicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('serviceId')
  
  const [step, setStep] = useState(serviceId ? 2 : 1)
  const [services, setServices] = useState<any[]>([])
  const [consultants, setConsultants] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedTier, setSelectedTier] = useState<any>(null)
  const [selection, setSelection] = useState<any>(null)
  
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedMeetingType, setSelectedMeetingType] = useState<'ZOOM' | 'SUR_PLACE' | null>(null)
  const [isPaid, setIsPaid] = useState(false)
  const [loading, setLoading] = useState(true)

  const getRequiredDuration = () => {
    if (!selectedTier) return 1.5
    
    let config = selectedTier.sessionsConfig
    if (typeof config === 'string') {
      try {
        config = JSON.parse(config)
      } catch (e) {
        config = null
      }
    }
    
    if (Array.isArray(config) && config.length > 0 && config[0].duration) {
      return Number(config[0].duration) / 60
    }
    
    if (selectedTier.maxCallDuration) {
      return Number(selectedTier.maxCallDuration) / 60
    }
    
    return 1.5
  }

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
        setServices(data)
        if (serviceId) {
          const service = data.find((s: any) => s.id === serviceId)
          if (service) setSelectedService(service)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
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
        .catch(() => setConsultants([]))
    }
  }, [step, scheduleStartDate, selectedTier])

  const handleServiceSelect = (service: any) => {
    setSelectedService(service)
    setStep(2)
  }

  const handleTierSelect = (tier: any) => {
    setSelectedTier(tier)
    setShowPaymentModal(true)
  }

  const handleMeetingTypeConfirm = (type: 'ZOOM' | 'SUR_PLACE') => {
    setSelectedMeetingType(type)
    setShowMeetingModal(false)
    setStep(3)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setIsPaid(true)
    setShowMeetingModal(true)
  }

  const handlePurchase = async () => {
    if (!selectedTier || !selection || !isPaid) return

    try {
      const res = await fetch('/api/client/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceTierId: selectedTier.id,
          consultantId: selection.consultantId,
          startTime: selection.startTime,
          endTime: selection.endTime,
          meetingType: selectedMeetingType || 'ZOOM'
        })
      })

      if (res.ok) {
        toast.success('Commande créée avec succès !')
        setStep(1)
        setSelectedService(null)
        setSelectedTier(null)
        setSelection(null)
        setIsPaid(false)
        router.push('/client')
      } else {
        toast.error('Erreur lors de la réservation.')
      }
    } catch (error) {
      toast.error('Erreur de connexion.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Chargement de l'espace client...</p>
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
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
              <div key={service.id} className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 shadow-sm text-3xl">
                  🎯
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{service.name}</h2>
                <p className="text-gray-600 mb-8 line-clamp-3 leading-relaxed">
                  {service.description}
                </p>
                <button
                  onClick={() => handleServiceSelect(service)}
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
          <div className="space-y-12 animate-in fade-in duration-700">
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

            <TierSelector tiers={selectedService.tiers} onSelect={handleTierSelect} />
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
                Changer de formule
              </button>
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                CHOIX DU CRÉNEAU
              </div>
            </div>

            <div className="text-center max-w-2xl mx-auto mb-12">
              <h3 className="text-3xl font-serif font-black text-gray-900 mb-4">Sélectionnez votre créneau</h3>
              <p className="text-gray-500 font-medium tracking-wide">Réservez votre séance avec nos experts consultants.</p>
            </div>

            <AvailabilityCalendar 
              consultants={consultants} 
              onSelect={setSelection}
              scheduleStartDate={scheduleStartDate}
              requiredDuration={getRequiredDuration()}
              onJumpToDate={setScheduleStartDate}
              onNavigate={(days) => {
                const newDate = new Date(scheduleStartDate)
                newDate.setDate(newDate.getDate() + days)
                const today = new Date()
                today.setHours(0,0,0,0)
                setScheduleStartDate(newDate < today ? today : newDate)
              }}
            />

            {selection && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-40 animate-in slide-in-from-bottom-10 duration-500">
                <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_30px_60px_rgba(0,0,0,0.15)] p-6 rounded-[2rem] flex items-center justify-between gap-8">
                   <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">✨</div>
                    <div>
                      <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Confirmation de séance</div>
                      <div className="font-bold text-gray-900">
                        {consultants.find(c => c.id === selection.consultantId)?.name} · {selection.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        <span className="text-blue-600 ml-2">
                          ({new Date(selection.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} – {new Date(selection.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handlePurchase}
                    className="bg-[#2B5A8E] hover:bg-[#1d3d61] text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all"
                  >
                    Confirmer et réserver
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showMeetingModal && (
          <MeetingTypeModal 
            serviceName={selectedService?.name}
            tierName={selectedTier?.name}
            onConfirm={handleMeetingTypeConfirm}
            onClose={() => setShowMeetingModal(false)}
          />
        )}

        {showPaymentModal && selectedTier && (
          <PaymentModal 
            price={selectedTier.price}
            tierName={selectedTier.name}
            onSuccess={handlePaymentSuccess}
            onClose={() => setShowPaymentModal(false)}
          />
        )}
      </div>
    </div>
  )
}
