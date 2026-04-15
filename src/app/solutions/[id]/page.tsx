'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TierSelector from '@/components/solutions/TierSelector'
import AvailabilityCalendar from '@/components/solutions/AvailabilityCalendar'
import MeetingTypeModal from '@/components/solutions/MeetingTypeModal'
import PaymentModal from '@/components/solutions/PaymentModal'
import { toast } from 'react-hot-toast'

export default function SolutionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id: serviceId } = params
  
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
        const service = data.find((s: any) => s.id === serviceId)
        if (service) {
          setSelectedService(service)
        } else {
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
        .catch(() => setConsultants([]))
    }
  }, [step, scheduleStartDate, selectedTier])

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
          startTime: selection.date.toISOString(), // Simplified logic for demonstration, would usually combine with startHour
          endTime: new Date(new Date(selection.date).setHours(selection.endHour)).toISOString(),
          meetingType: selectedMeetingType || 'ZOOM'
        })
      })

      if (res.ok) {
        toast.success('Commande créée avec succès !')
        router.push('/client')
      } else {
        toast.error('Une erreur est survenue lors de la réservation.')
      }
    } catch (error) {
      toast.error('Erreur de connexion au serveur.')
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

            <AvailabilityCalendar 
              consultants={consultants} 
              onSelect={setSelection}
              scheduleStartDate={scheduleStartDate}
              onNavigate={(days) => {
                const newDate = new Date(scheduleStartDate)
                newDate.setDate(newDate.getDate() + days)
                const today = new Date()
                today.setHours(0,0,0,0)
                setScheduleStartDate(newDate < today ? today : newDate)
              }}
            />

            {selection && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-40">
                <div className="bg-[#2B5A8E] text-white p-6 rounded-[2rem] shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md">
                  <div>
                    <div className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Créneau sélectionné</div>
                    <div className="font-bold">{selection.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })} à {selection.startHour}h</div>
                  </div>
                  <button onClick={handlePurchase} className="bg-white text-blue-900 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-colors">Confirmer la réservation</button>
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
