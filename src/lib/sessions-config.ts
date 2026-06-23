// ════════════════════════════════════════════════
// GESTION DU TEMPS DE CONSULTATION — basé sur maxCallDuration
// ════════════════════════════════════════════════
// Chaque ServiceTier a un budget total de minutes (maxCallDuration).
// On calcule TOUJOURS dynamiquement combien de minutes ont été
// utilisées, à partir des réservations existantes — jamais stocké
// en base, donc jamais désynchronisé.
//
// RÈGLE DE DURÉE :
// - Séance 1 (à l'achat) : min(maxCallDuration/60, 3h) — ou 1.5h si
//   maxCallDuration est vide/null (pack illimité type ULTIMATE)
// - Séances suivantes : min(minutesRestantes/60, 1.5h)
//
// Exemples avec cette règle :
//   BASIC    maxCallDuration=90  → Séance 1 = 1.5h → reste 0   → terminé
//   STANDARD maxCallDuration=180 → Séance 1 = 3h   → reste 0   → terminé
//   PREMIUM  maxCallDuration=450 → Séance 1 = 3h, puis 1.5h ×3 → reste 0
//   ULTIMATE maxCallDuration=null → Séance 1 = 1.5h, puis 1.5h...
//            jusqu'à ce que order.status === 'COMPLETED'

export const BUFFER_MINUTES        = 15   // pause ajoutée après chaque réunion (déjà incluse dans endTime stocké)
export const FIRST_SESSION_CAP_H   = 3    // durée max de la 1ère séance (en heures)
export const DEFAULT_SESSION_H     = 1.5  // durée par défaut des séances suivantes (en heures)
export const MIN_SESSION_MINUTES   = 30   // sous ce seuil, plus de séance proposée


// ── Types attendus en entrée ──
interface TierLike {
  maxCallDuration?: number | null  // en minutes, défini par l'admin
}

interface OrderLike {
  id: string
  status: string
  serviceTier: TierLike
}

interface ReservationLike {
  orderId: string | null
  status: string
  startTime: string | Date
  endTime: string | Date
}


/**
 * Retourne le budget total en minutes pour ce tier.
 * null = illimité (type ULTIMATE) — débloqué jusqu'à order.status === 'COMPLETED'
 */
export function getTotalMinutes(tier: TierLike): number | null {
  return tier.maxCallDuration && tier.maxCallDuration > 0 ? tier.maxCallDuration : null
}


/**
 * Durée de la SÉANCE 1 (réservée à l'achat), en heures.
 * - Si maxCallDuration est défini : min(maxCallDuration/60, 3h)
 * - Sinon (pack illimité) : 1.5h par défaut
 */
export function getFirstSessionDuration(tier: TierLike): number {
  const total = getTotalMinutes(tier)
  if (!total) return DEFAULT_SESSION_H
  return Math.min(total / 60, FIRST_SESSION_CAP_H)
}


/**
 * Une réservation est considérée "terminée" si :
 * - son statut est COMPLETED, OU
 * - son statut est CONFIRMED ET son endTime est déjà passé
 *   (la réunion a eu lieu, même si le consultant n'a pas cliqué "Terminer")
 */
export function isReservationFinished(r: ReservationLike): boolean {
  if (r.status === 'COMPLETED') return true
  if (r.status === 'CONFIRMED' && new Date(r.endTime) <= new Date()) return true
  return false
}


/**
 * Vrai s'il existe une réservation qui empêche d'en créer une nouvelle :
 * - PENDING (en attente de confirmation du consultant) → bloque
 * - CONFIRMED dont la réunion n'a PAS encore eu lieu → bloque
 */
export function hasBlockingReservation(reservations: ReservationLike[]): boolean {
  const now = new Date()
  return reservations.some(r => {
    if (r.status === 'PENDING') return true
    if (r.status === 'CONFIRMED' && new Date(r.endTime) > now) return true
    return false
  })
}


/**
 * Durée RÉELLE d'une réservation, en minutes — sans le buffer de 15 min
 * (le buffer est inclus dans endTime au moment de la création, on le retire ici
 *  pour ne compter que le temps de consultation réellement utilisé).
 */
export function getSessionMinutes(r: ReservationLike): number {
  const ms = new Date(r.endTime).getTime() - new Date(r.startTime).getTime()
  return Math.max(0, ms / 60000 - BUFFER_MINUTES)
}


/**
 * Total des minutes déjà utilisées (réservations "terminées" seulement).
 * C'est cette valeur qui doit s'afficher dans le dashboard, à la place
 * du champ order.callMinutesUsed (jamais mis à jour).
 */
export function getUsedMinutes(reservations: ReservationLike[]): number {
  return reservations
    .filter(isReservationFinished)
    .reduce((sum, r) => sum + getSessionMinutes(r), 0)
}


/**
 * Nombre de séances terminées — utilisé pour numéroter
 * "Séance 1", "Séance 2"...
 */
export function countFinishedSessions(reservations: ReservationLike[]): number {
  return reservations.filter(isReservationFinished).length
}


// ── Résultat retourné par getNextSessionInfo ──
export type NextSessionResult =
  | {
      canBook: false
      reason: 'ACTIVE_RESERVATION_EXISTS' | 'ALL_SESSIONS_DONE' | 'PROJECT_COMPLETED' | 'WAITING_FIRST_SESSION'
      usedMinutes: number
      totalMinutes: number | null
      remainingMinutes: number | null
    }
  | {
      canBook: true
      index: number
      label: string
      duration: number          // en heures
      usedMinutes: number
      totalMinutes: number | null
      remainingMinutes: number | null
    }


/**
 * Détermine si le client peut réserver sa prochaine séance, et laquelle.
 *
 * Règles :
 * - La toute première séance (index 0) est réservée au moment de l'achat —
 *   ce composant ne gère QUE les séances 2, 3, 4...
 * - Une réservation PENDING ou CONFIRMED-à-venir bloque toute nouvelle réservation
 * - Pack à budget (maxCallDuration défini) : débloqué tant que minutesRestantes >= 30
 * - Pack illimité (maxCallDuration null) : débloqué tant que order.status !== 'COMPLETED'
 */
export function getNextSessionInfo(
  order: OrderLike,
  myReservations: ReservationLike[]
): NextSessionResult {

  const total = getTotalMinutes(order.serviceTier)

  // 1. La première séance doit déjà exister (réservée à l'achat)
  if (myReservations.length === 0) {
    return {
      canBook: false,
      reason: 'WAITING_FIRST_SESSION',
      usedMinutes: 0,
      totalMinutes: total,
      remainingMinutes: total
    }
  }

  const used      = getUsedMinutes(myReservations)
  const remaining = total !== null ? total - used : null
  const nextIndex = countFinishedSessions(myReservations)

  // 2. Une réservation bloque-t-elle la suite ?
  if (hasBlockingReservation(myReservations)) {
    return { canBook: false, reason: 'ACTIVE_RESERVATION_EXISTS', usedMinutes: used, totalMinutes: total, remainingMinutes: remaining }
  }

  // 3. Pack illimité (ULTIMATE) : le projet est-il clôturé par le consultant ?
  if (total === null) {
    if (order.status === 'COMPLETED') {
      return { canBook: false, reason: 'PROJECT_COMPLETED', usedMinutes: used, totalMinutes: null, remainingMinutes: null }
    }
    return {
      canBook: true,
      index: nextIndex,
      label: `Séance ${nextIndex + 1}`,
      duration: DEFAULT_SESSION_H,
      usedMinutes: used,
      totalMinutes: null,
      remainingMinutes: null
    }
  }

  // 4. Pack à budget : reste-t-il assez de temps pour une nouvelle séance ?
  if (remaining === null || remaining < MIN_SESSION_MINUTES) {
    return { canBook: false, reason: 'ALL_SESSIONS_DONE', usedMinutes: used, totalMinutes: total, remainingMinutes: Math.max(0, remaining || 0) }
  }

  const duration = Math.min(remaining / 60, DEFAULT_SESSION_H)

  return {
    canBook: true,
    index: nextIndex,
    label: `Séance ${nextIndex + 1}`,
    duration,
    usedMinutes: used,
    totalMinutes: total,
    remainingMinutes: remaining
  }
}