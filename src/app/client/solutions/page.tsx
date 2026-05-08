'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import TierSelector from '@/components/solutions/TierSelector'
import AvailabilityCalendar from '@/components/solutions/AvailabilityCalendar'
import MeetingTypeModal from '@/components/solutions/MeetingTypeModal'
import PaymentModal from '@/components/solutions/PaymentModal'
import { toast } from 'react-hot-toast'
import { Search, Zap, Package, ExternalLink, ArrowRight } from 'lucide-react'

export default function ClientServicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceIdParam = searchParams.get('serviceId')
  
  const [step, setStep] = useState(serviceIdParam ? 2 : 1) // 1: Service List, 2: Tier Selection, 3: Scheduling, 4: Expert Select
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedTier, setSelectedTier] = useState<any>(null)
  const [consultants, setConsultants] = useState<any[]>([])
  const [selection, setSelection] = useState<any>(null)
  
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedMeetingType, setSelectedMeetingType] = useState<'ZOOM' | 'SUR_PLACE' | null>(null)
  const [isPaid, setIsPaid] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activePaymentMethod, setActivePaymentMethod] = useState<'CARD' | 'VIREMENT' | 'SUR_PLACE'>('CARD')

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
        if (!user.error) setCurrentUser(user)
      })
      .catch(() => {})

    fetch('/api/services/with-tiers')
      .then(r => r.json())
      .then(data => {
        setServices(data)
        if (serviceIdParam) {
          const service = data.find((s: any) => s.id === serviceIdParam)
          if (service) setSelectedService(service)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [serviceIdParam])

  useEffect(() => {
    if ((step === 3 || step === 4) && selectedTier) {
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
    if (!currentUser || currentUser.role !== 'CLIENT') {
      toast.error('Veuillez vous connecter en tant que client pour continuer.')
      router.push('/login?redirect=/client/solutions')
      return
    }

    setSelectedTier(tier)
    setShowPaymentModal(true)
  }

  const handleMeetingTypeConfirm = (type: 'ZOOM' | 'SUR_PLACE') => {
    setSelectedMeetingType(type)
    setShowMeetingModal(false)
    setStep(3)
  }

  const handlePaymentSuccess = (method: 'CARD' | 'VIREMENT' | 'SUR_PLACE') => {
    setShowPaymentModal(false)
    setIsPaid(true)
    setActivePaymentMethod(method)
    setSelectedMeetingType('ZOOM') 
    
    if (method === 'CARD') {
      setShowMeetingModal(true)
    } else {
      setStep(4)
    }
  }

  const handlePurchase = async (method: 'CARD' | 'VIREMENT' | 'SUR_PLACE' = 'CARD', consultantIdFromStep4?: string) => {
    if (!selectedTier) return

    try {
      const payload = {
        serviceTierId: selectedTier.id,
        consultantId: method === 'CARD' ? selection?.consultantId : (consultantIdFromStep4 || null),
        startTime: method === 'CARD' ? selection?.startTime : null,
        endTime: method === 'CARD' ? selection?.endTime : null,
        meetingType: method === 'CARD' ? (selectedMeetingType || 'ZOOM') : 'ZOOM',
        sessionIndex: 0,
        sessionLabel: null,
        paymentMethod: method
      };

      if (method === 'CARD' && (!payload.startTime || !payload.consultantId)) {
        toast.error("Veuillez sélectionner un créneau.");
        return;
      }

      const apiUrl = `${window.location.origin}/api/client/purchase`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const result = await res.json();
        if (method === 'CARD') {
          toast.success('Commande et réservation validées !')
        } else {
          toast.success(result.message || 'Commande enregistrée, en attente de paiement.')
        }
        router.push('/client')
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Une erreur est survenue.')
      }
    } catch (error: any) {
      toast.error('Erreur : ' + (error.message || 'Erreur inconnue'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-black uppercase text-xs tracking-widest">Initialisation de l'Expertise...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header Section */}
      <div className="bg-[#2B5A8E] text-white py-16 mb-12 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-1.5 w-12 bg-amber-400 rounded-full"></div>
            <span className="text-amber-400 font-black tracking-[0.3em] text-[10px] uppercase">Service Excellence</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 tracking-tight">
            {step === 1 ? 'Nos Solutions' : selectedService?.name}
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl font-medium opacity-90 leading-relaxed">
            {step === 1 
              ? 'Sélectionnez le domaine d\'expertise pour lequel vous souhaitez un accompagnement sur mesure.' 
              : selectedService?.description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-10">
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {services.map((service, index) => (
              <div key={service.id} className="group bg-white rounded-[3rem] p-10 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-blue-100 group-hover:bg-blue-700 transition-colors">
                    <img src={service.icon || service.logo} alt="" className="w-10 h-10 object-contain invert" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{service.name}</h2>
                  <p className="text-slate-500 font-medium mb-10 leading-relaxed max-w-md">
                    {service.description}
                  </p>
                  <button
                    onClick={() => handleServiceSelect(service)}
                    className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95 group/btn"
                  >
                    Explorer cette Solution
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && selectedService && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex items-center justify-between">
              <button onClick={() => setStep(1)} className="flex items-center gap-3 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-all group">
                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-blue-100 group-hover:bg-blue-50">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </div>
                Retour aux services
              </button>
              <div className="flex items-center gap-3 bg-blue-50 text-blue-600 px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-blue-100 shadow-sm">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                SÉLECTION DE LA FORMULE
              </div>
            </div>
            <TierSelector tiers={selectedService.tiers} onSelect={handleTierSelect} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
              <button onClick={() => setStep(2)} className="flex items-center gap-3 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-all group">
                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-blue-100 group-hover:bg-blue-50">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </div>
                Changer de formule
              </button>
              <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-emerald-100 shadow-sm">
                <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                PRISE DE RENDEZ-VOUS
              </div>
            </div>

            <div className="text-center max-w-2xl mx-auto mb-16">
              <h3 className="text-4xl font-serif font-black text-slate-900 mb-4 tracking-tight">Choisissez votre créneau</h3>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Validation de votre première session stratégique</p>
            </div>

            <AvailabilityCalendar 
              consultants={consultants} 
              onSelect={setSelection}
              scheduleStartDate={scheduleStartDate}
              requiredDuration={1.5}
              onNavigate={(days) => {
                const newDate = new Date(scheduleStartDate)
                newDate.setDate(newDate.getDate() + days)
                const today = new Date(); today.setHours(0,0,0,0);
                setScheduleStartDate(newDate < today ? today : newDate)
              }}
              onJumpToDate={setScheduleStartDate}
            />

            {selection && (
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-10 z-40">
                <div className="bg-[#2B5A8E] text-white p-8 rounded-[2.5rem] shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-xl">
                  <div>
                    <div className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em] mb-2">Slot Sélectionné</div>
                    <div className="font-bold text-xl">
                      {new Date(selection.startTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })} à {new Date(selection.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <button onClick={() => handlePurchase('CARD')} className="bg-white text-blue-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl active:scale-95">
                    Confirmer la Réservation
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h3 className="text-4xl font-serif font-black text-slate-900 mb-4 tracking-tight">Choisissez votre Expert</h3>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Votre accompagnement démarrera après validation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {consultants.map((c) => (
                <div key={c.id} className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-[2rem] bg-blue-600 mb-8 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-100">
                      {c.name.substring(0, 1)}
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">{c.name}</h4>
                    <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mb-6">{c.specialty}</p>
                    <button 
                      onClick={() => handlePurchase(activePaymentMethod, c.id)}
                      className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95 shadow-slate-200"
                    >
                      Sélectionner cet Expert
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
