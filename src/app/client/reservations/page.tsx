'use client'

import { useEffect, useState } from 'react'
import { JoinZoomButton } from '@/components/JoinZoomButton'

export default function ClientReservations() {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchData()
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => setCurrentUser(data))
      .catch(() => {})
  }, [])

  const fetchData = async () => {
    try {
      // The orders endpoint conveniently returns both orders and reservations for the client
      const res = await fetch('/api/client/orders')
      const data = await res.json()
      setReservations(data.reservations || [])
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  const getReservationStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700'
      case 'COMPLETED': return 'bg-blue-100 text-blue-700'
      case 'CANCELLED': return 'bg-red-100 text-red-700'
      case 'NO_SHOW': return 'bg-purple-100 text-purple-700'
      default: return 'bg-amber-100 text-amber-700'
    }
  }

  const canJoin = (reservation: any) => {
    const now = new Date()
    const start = new Date(reservation.startTime)
    const end = new Date(reservation.endTime)
    
    // Time before meeting when the join button becomes active (15 minutes)
    const earlyAccessMs = 15 * 60 * 1000 
    
    return now.getTime() >= (start.getTime() - earlyAccessMs) && now.getTime() <= end.getTime()
  }

  const latestReservation = reservations.length > 0 ? reservations[0] : null

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
           <h1 className="text-4xl font-serif font-black text-gray-900">Mes Réservations</h1>
           <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-xs font-bold shadow-sm">
              LISTE DES RENDEZ-VOUS
           </div>
        </div>

        {/* Table des rendez-vous header inspired by image */}
        <div className="bg-[#FAF9F6] border-2 border-amber-100 rounded-[2rem] p-8 shadow-sm overflow-hidden relative mb-12">
          <div className="absolute top-0 right-0 p-4 flex gap-2">
             <div className="w-6 h-6 border-2 border-blue-500/20 rounded flex items-center justify-center text-[10px] text-blue-500 font-bold">⤢</div>
             <div className="w-6 h-6 border-2 border-red-500/20 rounded flex items-center justify-center text-[10px] text-red-500 font-bold">✕</div>
          </div>

          <div className="flex flex-col xl:flex-row gap-10 items-start">
            {/* Photo Section */}
            <div className="w-32 h-40 bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden flex-shrink-0 relative group">
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
               <div className="w-full h-full flex items-center justify-center text-gray-300">
                 <svg className="w-20 h-20 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
               </div>
            </div>

            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-10">
               {/* Patient info row */}
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Id client</label>
                  <div className="bg-amber-100/40 border border-amber-200/50 rounded-xl px-4 py-3 font-bold text-gray-700 flex items-center text-sm">
                    {currentUser?.id?.slice(-8).toUpperCase() || 'P-432FDEB'}
                  </div>
               </div>

               <div className="space-y-2 lg:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Prénom et Nom du client</label>
                  <div className="bg-amber-100/40 border border-amber-200/50 rounded-xl px-4 py-3 font-bold text-gray-700 flex items-center text-sm">
                    {currentUser?.name || 'Veuillez vous connecter'}
                  </div>
               </div>

               {/* Appointment details row (showing latest) */}
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Date RDV</label>
                  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-blue-600 flex items-center text-sm shadow-sm">
                    {latestReservation ? new Date(latestReservation.startTime).toLocaleDateString('fr-FR') : '-- / -- / ----'}
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Heure Début</label>
                  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 flex items-center text-sm shadow-sm">
                    {latestReservation ? new Date(latestReservation.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-- : --'}
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">État du RDV</label>
                  <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm flex items-center shadow-sm">
                    {latestReservation ? (
                      <span className={`px-4 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest ${getReservationStatusColor(latestReservation.status)}`}>
                        {latestReservation.status}
                      </span>
                    ) : 'Aucun rendez-vous'}
                  </div>
               </div>

               <div className="space-y-2 lg:col-span-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Observation</label>
                  <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-500 flex items-center min-h-[60px] italic shadow-inner">
                    {latestReservation 
                      ? `${latestReservation.serviceTier.service.name} - ${latestReservation.serviceTier.tierType}. Expert: ${latestReservation.consultant.name}.`
                      : 'Vos informations de rendez-vous apparaîtront ici.'
                    }
                  </div>
               </div>
            </div>

            {/* Action column */}
            <div className="flex flex-col gap-3 w-full lg:w-48">
               <a href="/solutions" className="w-full py-4 rounded-xl text-center bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:bg-blue-700 hover:-translate-y-0.5">
                 Nouveau RDV
               </a>
               <button className="w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 opacity-50 cursor-not-allowed text-center">
                 Modifier RDV
               </button>
               <button className="w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors text-center">
                 Annuler
               </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
          {reservations.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-6">Aucune réservation pour le moment</p>
              <a 
                href="/solutions" 
                className="inline-flex items-center gap-2 bg-[#2B5A8E] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                Découvrir nos solutions
              </a>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phase / Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expert</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Heure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">État</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lien Direct</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map(reservation => (
                  <tr key={reservation.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200">
                           {reservation.sessionIndex + 1}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{reservation.sessionLabel || 'Consultation'}</div>
                          <div className="text-xs text-gray-500 italic">{reservation.serviceTier.service.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{reservation.consultant.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{reservation.consultant.specialty}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{new Date(reservation.startTime).toLocaleDateString('fr-FR')}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">
                        {new Date(reservation.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(reservation.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getReservationStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {reservation.zoomJoinUrl && reservation.status === 'CONFIRMED' && canJoin(reservation) && (
                        <JoinZoomButton joinUrl={reservation.zoomJoinUrl} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
