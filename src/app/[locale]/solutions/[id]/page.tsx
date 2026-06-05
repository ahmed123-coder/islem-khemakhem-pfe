'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TierSelector from '@/components/solutions/TierSelector'
import AvailabilityCalendar from '@/components/solutions/AvailabilityCalendar'
import MeetingTypeModal from '@/components/solutions/MeetingTypeModal'
import PaymentModal from '@/components/solutions/PaymentModal'
import { toast } from 'react-hot-toast'

export default function SolutionDetailPage({ params }: { params: { locale: string; id: string } }) {
  const router = useRouter()
  const { locale, id: serviceId } = params
  
  const [step, setStep] = useState(2) // 2: Tier Selection, 3: Scheduling
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedTier, setSelectedTier] = useState<any>(null)
  const [consultants, setConsultants] = useState<any[]>([])
  const [selection, setSelection] = useState<any>(null)
  
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedMeetingType, setSelectedMeetingType] = useState<'ZOOM' | 'SUR_PLACE' | null>(null)
  const [isPaid, setIsPaid] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [scheduleStartDate, setScheduleStartDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  useEffect(() => {
    setLoading(true)
    
    // Fetch Auth State
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(res => {
        const user = res.data || res
        if (user && !user.error && user.id) setCurrentUser(user)
        setAuthLoading(false)
      })
      .catch(() => setAuthLoading(false))

    fetch('/api/services/with-tiers')
      .then(r => r.json())
      .then(res => {
        const data = res.data || res
        const service = Array.isArray(data) ? data.find((s: any) => s.id === serviceId) : null
        if (service) {
          setSelectedService(service)
        } else {
          router.push(`/${locale}/solutions`)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [serviceId, router])

  useEffect(() => {
    if ((step === 3 || step === 4) && selectedTier) {
      const startDateStr = scheduleStartDate.toISOString().split('T')[0]
      const fetchUrl = `/api/consultants/schedule?startDate=${startDateStr}&days=7&serviceTierId=${selectedTier.id}`
      fetch(fetchUrl)
        .then(r => r.json())
        .then(res => {
          const data = res.data || res
          if (Array.isArray(data)) {
            setConsultants(data)
          } else {
            setConsultants([])
          }
        })
        .catch(() => setConsultants([]))
    }
  }, [step, scheduleStartDate, selectedTier])

  const [selectedConsultant, setSelectedConsultant] = useState<any>(null)

  const handleTierSelect = (tier: any) => {
    if (!currentUser || currentUser.role !== 'CLIENT') {
      toast.error('Veuillez vous connecter en tant que client pour continuer.')
      router.push(`/${locale}/login?redirect=/${locale}/solutions/${serviceId}`)
      return
    }

    setSelectedTier(tier)
    // Move to scheduling so user picks a slot before payment
    setStep(3)
  }

  const handleMeetingTypeConfirm = (type: 'ZOOM' | 'SUR_PLACE') => {
    setSelectedMeetingType(type)
    setShowMeetingModal(false)
    setStep(3)
  }

  const [activePaymentMethod, setActivePaymentMethod] = useState<'CARD' | 'VIREMENT' | 'SUR_PLACE'>('CARD')

  const handlePaymentSuccess = (method: 'CARD' | 'VIREMENT' | 'SUR_PLACE') => {
    setShowPaymentModal(false)
    setIsPaid(true)
    setActivePaymentMethod(method)

    // After payment success, call purchase to create order/reservation (handlePurchase handles CARD vs others)
    handlePurchase(method)
  }

  const handlePurchase = async (method: 'CARD' | 'VIREMENT' | 'SUR_PLACE' = 'CARD', consultantIdFromStep4?: string) => {
    if (!selectedTier) return

    try {
      console.log("Starting purchase process for method:", method);
      
      const requiresSlot = method === 'CARD' || method === 'SUR_PLACE'
      const payload = {
        serviceTierId: selectedTier.id,
        consultantId: requiresSlot ? selection?.consultantId : (consultantIdFromStep4 || null),
        startTime: requiresSlot ? selection?.startTime : null,
        endTime: requiresSlot ? selection?.endTime : null,
        meetingType: selectedMeetingType || (method === 'SUR_PLACE' ? 'SUR_PLACE' : 'ZOOM'),
        sessionIndex: 0,
        sessionLabel: null,
        paymentMethod: method
      };

      if (requiresSlot && (!payload.startTime || !payload.consultantId)) {
        toast.error("Veuillez sélectionner un créneau.");
        return;
      }

      console.log("Sending payload:", payload);

      const apiUrl = `${window.location.origin}/api/client/purchase`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const result = await res.json();
        console.log("Purchase successful:", result);
        
        if (method === 'CARD') {
          toast.success('Commande et réservation validées !')
        } else {
          toast.success(result.message || 'Commande enregistrée, en attente de paiement.')
        }
        
        router.push(`/${locale}/client`)
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Une erreur est survenue.')
      }
    } catch (error: any) {
      console.error('CRITICAL FETCH ERROR:', error)
      toast.error('Erreur : ' + (error.message || 'Check browser console'))
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
                onClick={() => router.push(`/${locale}/solutions`)} 
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors group"
              >
                
              </button>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                Découvrez nos différentes offres et choisissez celle qui correspond le mieux à vos besoins.
              </div>
              <button 
                onClick={() => router.push(`/${locale}/solutions`)} 
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors group">
              </button>
              <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </div>
                Retour aux solutions
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
                Revenir aux formules
              </button>
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                PRISE DE RENDEZ-VOUS
              </div>
            </div>

            <div className="text-center max-w-2xl mx-auto mb-12">
              <h3 className="text-3xl font-serif font-black text-gray-900 mb-4">Sélectionnez votre créneau</h3>
              <p className="text-gray-500 font-medium">Réservez dès maintenant votre première session stratégique.</p>
            </div>

            {consultants.length === 0 ? (
               <div className="bg-amber-50 border-2 border-amber-100 rounded-[2.5rem] p-12 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">👤</span>
                  </div>
                  <h4 className="text-xl font-bold text-amber-900 mb-2">Aucun consultant disponible</h4>
                  <p className="text-amber-700/70 text-sm max-w-md mx-auto">
                    Nos experts sont actuellement tous occupés ou non assignés à ce service spécifique. Veuillez réessayer plus tard ou contacter le support.
                  </p>
               </div>
            ) : (
              <AvailabilityCalendar 
                consultants={consultants} 
                onSelect={setSelection}
                scheduleStartDate={scheduleStartDate}
                requiredDuration={(() => {
                  let finalDuration = 1.5; // Default fallback
                  try {
                    const sessions = typeof selectedTier?.sessionsConfig === 'string' 
                      ? JSON.parse(selectedTier.sessionsConfig) 
                      : selectedTier?.sessionsConfig;
                    
                    if (Array.isArray(sessions) && sessions.length > 0) {
                      const firstSessionDuration = Number(sessions[0].duration);
                      if (!isNaN(firstSessionDuration) && firstSessionDuration > 0) {
                        finalDuration = firstSessionDuration / 60;
                        return finalDuration;
                      }
                    }

                    // Secondary fallback based on tier type if sessionsConfig is empty/invalid
                    if (selectedTier?.tierType === 'STANDARD' || selectedTier?.tierType === 'PREMIUM') {
                      finalDuration = 3;
                    }
                  } catch (e) {
                    console.error("Error determining requiredDuration:", e);
                  }
                  return finalDuration;
                })()}
                onNavigate={(days) => {
                  const newDate = new Date(scheduleStartDate)
                  newDate.setDate(newDate.getDate() + days)
                  const today = new Date()
                  today.setHours(0,0,0,0)
                  setScheduleStartDate(newDate < today ? today : newDate)
                }}
                onJumpToDate={(date) => {
                  const d = new Date(date)
                  d.setHours(0, 0, 0, 0)
                  setScheduleStartDate(d)
                }}
              />
            )}

            {selection && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-40">
                <div className="bg-[#2B5A8E] text-white p-6 rounded-[2rem] shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md">
                  <div>
                    <div className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Créneau sélectionné</div>
                    <div className="font-bold">
                      {new Date(selection.startTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })} à {new Date(selection.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[10px] opacity-60">Fin prévue à {new Date(selection.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <button onClick={() => setShowPaymentModal(true)} className="bg-white text-blue-900 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-colors">Confirmer la réservation</button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h3 className="text-3xl font-serif font-black text-gray-900 mb-4">Choisissez votre Expert</h3>
              <p className="text-gray-500 font-medium">Sélectionnez le consultant avec lequel vous souhaitez collaborer. Le rendez-vous sera fixé ultérieurement.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {consultants.map((c) => (
                <div key={c.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-[2rem] bg-blue-600 mb-6 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100">
                      {c.name.substring(0, 1)}
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">{c.name}</h4>
                    <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">{c.specialty}</p>
                    <p className="text-slate-500 text-sm mb-8 line-clamp-3 leading-relaxed">{c.bio || "Expert consultant spécialisé dans l'accompagnement stratégique."}</p>
                    <button 
                      onClick={() => handlePurchase(activePaymentMethod, c.id)}
                      className="w-full bg-[#2B5A8E] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                    >
                      Sélectionner cet expert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showMeetingModal && (
          <MeetingTypeModal 
            serviceName={selectedService?.name}
            tierName={selectedTier?.tierType}
            onConfirm={handleMeetingTypeConfirm}
            onClose={() => setShowMeetingModal(false)}
          />
        )}

        {showPaymentModal && selectedTier && (
          <PaymentModal 
            price={selectedTier.price}
            tierName={selectedTier.tierType}
            onSuccess={handlePaymentSuccess}
            onClose={() => setShowPaymentModal(false)}
          />
        )}
      </div>
    </div>
  )
}
