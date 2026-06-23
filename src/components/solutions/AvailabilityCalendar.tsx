'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Video, Building2, Check } from 'lucide-react'

// ════════════════════════════════════════════════
// TYPES — même structure qu'avant, rien ne change
// ════════════════════════════════════════════════
interface Reservation { id: string; startTime: string; endTime: string }
interface Consultant  { id: string; name: string; specialty?: string; reservations: Reservation[] }
interface Selection   { consultantId: string; date: Date; startTime: string; endTime: string; startHour: number; endHour: number }
interface Props {
  consultants: Consultant[]
  onSelect: (s: Selection & { meetingType: 'ZOOM' | 'SUR_PLACE' }) => void
  scheduleStartDate: Date
  onNavigate: (days: number) => void
  onJumpToDate?: (date: Date) => void
  requiredDuration: number
}

// ════════════════════════════════════════════════
// CONSTANTES
// ════════════════════════════════════════════════
const HOURS      = [9, 10, 11, 12, 13, 14, 15, 16, 17]  // créneaux de 9h à 17h
const BUFFER_MIN = 15                                      // 15 min de repos APRÈS chaque réunion
const MOIS_FR    = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const JOURS_FR   = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']

export default function AvailabilityCalendar({
  consultants,
  onSelect,
  scheduleStartDate,
  onNavigate,
  onJumpToDate,
  requiredDuration
}: Props) {

  // ── ÉTATS ────────────────────────────────────
  const [selectedDate,    setSelectedDate]    = useState<Date | null>(null)      // jour choisi
  const [selectedHour,    setSelectedHour]    = useState<number | null>(null)    // heure choisie
  const [meetingType,     setMeetingType]     = useState<'ZOOM' | 'SUR_PLACE' | null>(null) // type réunion
  const [consultantIdx,   setConsultantIdx]   = useState(0)                      // consultant actif
  const [currentMonth,    setCurrentMonth]    = useState(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  })

  // durée de la session (par défaut 1.5h si invalide)
  const duration   = isNaN(requiredDuration) || requiredDuration <= 0 ? 1.5 : requiredDuration
  const consultant = consultants[consultantIdx]


  // ════════════════════════════════════════════════
  // LOGIQUE DE DISPONIBILITÉ — identique à l'original
  // Buffer de 15 min calculé APRÈS la fin de chaque réunion existante
  // ════════════════════════════════════════════════
  const getSlotInfo = (date: Date, h: number): {
    available: boolean
    blockedByReservation?: boolean
    nextAvailable?: string
  } => {
    const start = new Date(date)
    start.setHours(h, 0, 0, 0)
    const end = new Date(start.getTime() + duration * 3600000)

    // créneau doit être dans le futur
    if (start <= new Date()) return { available: false }

    // la fin de session ne doit pas dépasser 18h
    const endMinutes = end.getHours() * 60 + end.getMinutes()
    if (endMinutes > 18 * 60) return { available: false }

    if (!consultant) return { available: false }

    // vérifie le chevauchement avec les réservations existantes
    // le buffer de 15 min est ajouté APRÈS endTime de chaque réservation
    const conflict = consultant.reservations.find(r => {
      const resStart = new Date(r.startTime).getTime()
      const resEnd   = new Date(r.endTime).getTime() + BUFFER_MIN * 60000 // ← buffer APRÈS la réunion
      return start.getTime() < resEnd && end.getTime() > resStart
    })

    if (conflict) {
      // calcule le prochain créneau disponible après le buffer
      const resEnd = new Date(conflict.endTime)
      resEnd.setMinutes(resEnd.getMinutes() + BUFFER_MIN)
      const nextSlot = `${String(resEnd.getHours()).padStart(2,'0')}:${String(resEnd.getMinutes()).padStart(2,'0')}`
      return { available: false, blockedByReservation: true, nextAvailable: nextSlot }
    }

    return { available: true }
  }

  // vérifie si un jour a AU MOINS un créneau disponible
  const dayHasSlots = (date: Date): boolean => {
    return HOURS.some(h => getSlotInfo(date, h).available)
  }


  // ════════════════════════════════════════════════
  // GÉNÉRATION DES JOURS DU MOIS pour le calendrier
  // ════════════════════════════════════════════════
  const getDaysInMonth = () => {
    const year  = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const first = new Date(year, month, 1)
    const last  = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []

    // cases vides avant le 1er jour du mois
    for (let i = 0; i < first.getDay(); i++) days.push(null)

    // jours du mois
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(year, month, d))
    }
    return days
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)


  // ════════════════════════════════════════════════
  // ACTIONS UTILISATEUR
  // ════════════════════════════════════════════════

  // quand le client clique sur un jour
  const handleDateClick = (date: Date) => {
    const isPast = date < today
    if (isPast || !dayHasSlots(date)) return
    setSelectedDate(date)
    setSelectedHour(null)    // remet à zéro l'heure quand on change de jour
    setMeetingType(null)     // remet à zéro le type de réunion
  }

  // quand le client clique sur une heure
  const handleHourClick = (h: number) => {
    if (!selectedDate) return
    const { available, nextAvailable } = getSlotInfo(selectedDate, h)
    if (!available) {
      if (nextAvailable) toast.error(`Indisponible. Prochain créneau : ${nextAvailable}`)
      else               toast.error('Créneau indisponible')
      return
    }
    setSelectedHour(h)
    setMeetingType(null) // remet à zéro si on change d'heure
  }

  // quand le client choisit le type de réunion — envoie la sélection complète au parent
  const handleMeetingType = (type: 'ZOOM' | 'SUR_PLACE') => {
    if (!selectedDate || selectedHour === null) return
    setMeetingType(type)

    const start = new Date(selectedDate)
    start.setHours(selectedHour, 0, 0, 0)
    const end = new Date(start.getTime() + duration * 3600000)

    // envoie la sélection complète au composant parent (même format qu'avant + meetingType)
    onSelect({
      consultantId: consultant.id,
      date:         selectedDate,
      startTime:    start.toISOString(),
      endTime:      end.toISOString(),
      startHour:    selectedHour,
      endHour:      selectedHour + duration,
      meetingType:  type
    })
  }

  // réinitialise tout
  const handleReset = () => {
    setSelectedDate(null)
    setSelectedHour(null)
    setMeetingType(null)
    onSelect(null as any)
  }

  const days = getDaysInMonth()


  // ════════════════════════════════════════════════
  // RENDU
  // ════════════════════════════════════════════════
  return (
    <div className="space-y-6">


      {/* Carte consultant — nom visible avant de choisir */}
      {consultant && (
        <div className="bg-white rounded-2xl border-2 border-[#1B3F7A]/10 shadow-sm p-5 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#1B3F7A] flex items-center justify-center text-white text-2xl font-black flex-shrink-0 shadow-lg shadow-blue-100">
            {consultant.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-[#1B3F7A] uppercase tracking-[0.2em] mb-0.5">
              Votre consultant
            </p>
            <p className="text-lg font-black text-gray-900 truncate">{consultant.name}</p>
            {consultant.specialty && (
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">
                {consultant.specialty}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Disponibilités</p>
            <div className="flex items-center gap-2 justify-end">
              <span className="w-2 h-2 rounded-full bg-green-500 block"></span>
              <span className="text-xs font-black text-green-600">En ligne</span>
            </div>
          </div>
        </div>
      )}

      {/* Onglets consultants — si plusieurs consultants */}
      {consultants.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {consultants.map((c, i) => (
            <button
              key={c.id}
              onClick={() => { setConsultantIdx(i); handleReset() }}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-bold border transition-all',
                i === consultantIdx
                  ? 'bg-[#1B3F7A] text-white border-[#1B3F7A]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B3F7A]'
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}


      {/* ══════════════════════════════════════════
          ÉTAPE 1 — CHOISIR LA DATE
          Calendrier mensuel simple
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* En-tête du mois avec navigation */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
          <button
            onClick={() => {
              const d = new Date(currentMonth)
              d.setMonth(d.getMonth() - 1)
              // ne pas aller avant le mois actuel
              if (d >= new Date(today.getFullYear(), today.getMonth(), 1)) setCurrentMonth(d)
            }}
            className="p-2 rounded-lg border border-gray-200 hover:border-[#1B3F7A] hover:text-[#1B3F7A] transition-all disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <div className="flex items-center gap-2 text-[10px] font-black text-[#1B3F7A] uppercase tracking-[0.2em] justify-center mb-0.5">
              <span className="w-2 h-2 rounded-full bg-[#1B3F7A]" />
              Étape 1
            </div>
            <span className="text-sm font-black text-gray-800">
              {MOIS_FR[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
          </div>

          <button
            onClick={() => {
              const d = new Date(currentMonth)
              d.setMonth(d.getMonth() + 1)
              setCurrentMonth(d)
            }}
            className="p-2 rounded-lg border border-gray-200 hover:border-[#1B3F7A] hover:text-[#1B3F7A] transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {JOURS_FR.map(j => (
            <div key={j} className="py-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-wider">
              {j}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7 p-3 gap-1">
          {days.map((date, i) => {
            if (!date) return <div key={i} />

            const isPast      = date < today
            const hasSlots    = !isPast && dayHasSlots(date)
            const isSelected  = selectedDate?.toDateString() === date.toDateString()
            const isToday     = date.toDateString() === today.toDateString()

            return (
              <button
                key={i}
                onClick={() => handleDateClick(date)}
                disabled={isPast || !hasSlots}
                className={cn(
                  'relative h-10 w-full rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-0.5',
                  isSelected
                    ? 'bg-[#1B3F7A] text-white shadow-lg shadow-blue-200'
                    : hasSlots
                    ? 'hover:bg-blue-50 hover:text-[#1B3F7A] text-gray-700 cursor-pointer'
                    : 'text-gray-300 cursor-not-allowed'
                )}
              >
                <span className={cn(isToday && !isSelected && 'text-[#1B3F7A] font-black')}>
                  {date.getDate()}
                </span>
                {/* point vert si des créneaux sont disponibles */}
                {hasSlots && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-green-500 absolute bottom-1" />
                )}
                {isToday && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-[#1B3F7A] absolute bottom-1" />
                )}
              </button>
            )
          })}
        </div>

        {/* Légende */}
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex gap-4 text-[10px] font-bold text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Créneaux disponibles
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1B3F7A]" /> Jour sélectionné
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-200" /> Indisponible
          </span>
        </div>
      </div>


      {/* ══════════════════════════════════════════
          ÉTAPE 2 — CHOISIR L'HEURE
          S'affiche seulement quand une date est choisie
      ══════════════════════════════════════════ */}
      {selectedDate && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 text-[10px] font-black text-[#1B3F7A] uppercase tracking-[0.2em] mb-0.5">
              <span className="w-2 h-2 rounded-full bg-[#1B3F7A]" />
              Étape 2
            </div>
            <p className="text-sm font-black text-gray-800">
              Créneaux disponibles le{' '}
              <span className="text-[#1B3F7A]">
                {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </p>
            <p className="text-[11px] text-gray-400 font-bold mt-0.5">
              Durée de session : {duration}h · Buffer de repos : {BUFFER_MIN} min après chaque réunion
            </p>
          </div>

          {/* Boutons des créneaux horaires */}
          <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {HOURS.map(h => {
              const { available, nextAvailable } = getSlotInfo(selectedDate, h)
              const isSelected = selectedHour === h
              const endH       = h + duration

              return (
                <button
                  key={h}
                  onClick={() => handleHourClick(h)}
                  disabled={!available}
                  title={!available && nextAvailable ? `Prochain : ${nextAvailable}` : undefined}
                  className={cn(
                    'relative rounded-xl py-3 px-2 text-center transition-all border-2 font-bold',
                    isSelected
                      ? 'bg-[#1B3F7A] border-[#1B3F7A] text-white shadow-lg shadow-blue-200 scale-105'
                      : available
                      ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:border-green-500 hover:scale-105 cursor-pointer'
                      : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                  )}
                >
                  {/* icône check si sélectionné */}
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div className="text-sm font-black">
                    {String(h).padStart(2, '0')}:00
                  </div>
                  <div className="text-[10px] font-bold opacity-70 mt-0.5">
                    → {String(Math.floor(endH)).padStart(2, '0')}:{endH % 1 === 0.5 ? '30' : '00'}
                  </div>
                  {/* label disponible / non dispo */}
                  <div className={cn(
                    'text-[9px] font-black uppercase tracking-wider mt-1',
                    isSelected ? 'text-blue-200' : available ? 'text-green-500' : 'text-gray-300'
                  )}>
                    {isSelected ? 'Choisi' : available ? 'Libre' : 'Pris'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}


      {/* ══════════════════════════════════════════
          ÉTAPE 3 — TYPE DE RÉUNION
          S'affiche seulement quand date + heure sont choisies
      ══════════════════════════════════════════ */}
      {selectedDate && selectedHour !== null && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 text-[10px] font-black text-[#1B3F7A] uppercase tracking-[0.2em] mb-0.5">
              <span className="w-2 h-2 rounded-full bg-[#1B3F7A]" />
              Étape 3
            </div>
            <p className="text-sm font-black text-gray-800">Comment souhaitez-vous vous retrouver ?</p>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Bouton ZOOM */}
            <button
              onClick={() => handleMeetingType('ZOOM')}
              className={cn(
                'flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left',
                meetingType === 'ZOOM'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-500 hover:shadow-md'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                meetingType === 'ZOOM' ? 'bg-white/20' : 'bg-white shadow-sm'
              )}>
                <Video className={cn('w-6 h-6', meetingType === 'ZOOM' ? 'text-white' : 'text-blue-600')} />
              </div>
              <div>
                <div className="font-black text-sm">Visioconférence Zoom</div>
                <div className={cn('text-[10px] font-bold uppercase tracking-wider mt-0.5',
                  meetingType === 'ZOOM' ? 'text-blue-200' : 'text-blue-400'
                )}>
                  Réunion à distance · Lien généré automatiquement
                </div>
              </div>
              {meetingType === 'ZOOM' && (
                <Check className="w-5 h-5 text-white ml-auto" strokeWidth={3} />
              )}
            </button>

            {/* Bouton SUR_PLACE */}
            <button
              onClick={() => handleMeetingType('SUR_PLACE')}
              className={cn(
                'flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left',
                meetingType === 'SUR_PLACE'
                  ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-200'
                  : 'bg-green-50 border-green-200 text-green-700 hover:border-green-500 hover:shadow-md'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                meetingType === 'SUR_PLACE' ? 'bg-white/20' : 'bg-white shadow-sm'
              )}>
                <Building2 className={cn('w-6 h-6', meetingType === 'SUR_PLACE' ? 'text-white' : 'text-green-600')} />
              </div>
              <div>
                <div className="font-black text-sm">Rencontre sur place</div>
                <div className={cn('text-[10px] font-bold uppercase tracking-wider mt-0.5',
                  meetingType === 'SUR_PLACE' ? 'text-green-200' : 'text-green-400'
                )}>
                  Réunion physique · Dans nos locaux
                </div>
              </div>
              {meetingType === 'SUR_PLACE' && (
                <Check className="w-5 h-5 text-white ml-auto" strokeWidth={3} />
              )}
            </button>
          </div>
        </div>
      )}


      {/* ══════════════════════════════════════════
          RÉCAPITULATIF FINAL
          S'affiche quand tout est sélectionné
      ══════════════════════════════════════════ */}
      {selectedDate && selectedHour !== null && meetingType && (
        <div className="bg-[#1B3F7A] rounded-2xl p-5 text-white shadow-xl shadow-blue-900/20">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">
                ✅ Réservation prête à confirmer
              </p>
              <p className="font-black text-lg">
                {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <p className="text-blue-200 font-bold text-sm">
                {String(selectedHour).padStart(2, '0')}:00
                {' → '}
                {String(Math.floor(selectedHour + duration)).padStart(2, '0')}:{(selectedHour + duration) % 1 === 0.5 ? '30' : '00'}
                {' · '}
                {meetingType === 'ZOOM' ? '🎥 Zoom' : '🏢 Sur place'}
              </p>
              <p className="text-[10px] text-blue-300 font-bold">
                Consultant : {consultant?.name}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-[10px] font-black text-blue-300 hover:text-white uppercase tracking-widest transition-colors flex-shrink-0 mt-1"
            >
              Modifier
            </button>
          </div>
        </div>
      )}

    </div>
  )
}