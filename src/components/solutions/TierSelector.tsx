'use client'

import { cn } from "@/lib/utils"

interface ServiceTier {
  id: string
  name: string
  description?: string
  tierType?: string
  price: number
  messageLimit?: number
  maxMessages?: number
  callLimit?: number
  maxCallDuration?: number
  canSelectConsultant?: boolean
}

interface TierSelectorProps {
  tiers: ServiceTier[]
  onSelect: (tier: ServiceTier) => void
}

export default function TierSelector({ tiers, onSelect }: TierSelectorProps) {
  const getTierIcon = (tierType: string) => {
    switch (tierType) {
      case 'BASIC': return '🌱'
      case 'STANDARD': return '🎓'
      case 'PREMIUM': return '🚀'
      case 'ULTIMATE': return '👑'
      default: return '📦'
    }
  }

  const getTierColor = (tierType: string) => {
    switch (tierType) {
      case 'BASIC': return 'from-teal-500 to-emerald-600'
      case 'STANDARD': return 'from-blue-500 to-indigo-600'
      case 'PREMIUM': return 'from-purple-500 to-pink-600'
      case 'ULTIMATE': return 'from-slate-800 to-slate-900'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getTierBorder = (tierType: string) => {
    switch (tierType) {
      case 'BASIC': return 'border-emerald-100 hover:border-emerald-300'
      case 'STANDARD': return 'border-blue-100 hover:border-blue-300'
      case 'PREMIUM': return 'border-purple-100 hover:border-purple-300 ring-2 ring-purple-50'
      case 'ULTIMATE': return 'border-slate-200 hover:border-slate-800 shadow-xl shadow-slate-100'
      default: return 'border-gray-200'
    }
  }

  const getPackNumber = (tierType: string) => {
    switch (tierType) {
      case 'BASIC': return 'PACK 1'
      case 'STANDARD': return 'PACK 2'
      case 'PREMIUM': return 'PACK 3'
      case 'ULTIMATE': return 'PACK 4'
      default: return 'PACK'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {tiers.map((tier) => {
        const type = tier.tierType || ''
        const isUltimate = type === 'ULTIMATE'
        const isPremium = type === 'PREMIUM'
        
        return (
          <div 
            key={tier.id} 
            className={`relative bg-white rounded-[2.5rem] border-2 ${getTierBorder(type)} p-6 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group`}
          >
            {(isPremium || isUltimate) && (
              <div className={cn(
                "absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[10px] font-black uppercase tracking-widest px-6 py-1.5 rounded-full shadow-lg border-2 border-white",
                isUltimate ? "bg-slate-900" : "bg-gradient-to-r from-purple-500 to-pink-500"
              )}>
                {isUltimate ? 'Accompagnement Complet' : 'Plus Populaire'}
              </div>
            )}
            <div className={`bg-gradient-to-br ${getTierColor(type)} text-white rounded-3xl p-5 mb-6 text-center shadow-lg transform group-hover:scale-105 transition-transform duration-500`}>
              <div className="text-3xl mb-1">{getTierIcon(type)}</div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-1">{getPackNumber(type)}</h4>
              <h3 className="text-sm font-bold uppercase tracking-wider line-clamp-1">{tier.description?.split(':')[1]?.trim() || type}</h3>
            </div>
            
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-1">
                <span className="text-4xl font-black text-gray-900 tracking-tight">{Number(tier.price).toFixed(0)}</span>
                <span className="text-lg text-gray-400 font-bold self-start mt-1">DT</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Investissement</p>
            </div>

            <div className="space-y-3 mb-8 flex-1">
              <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col gap-2">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Détails de l'offre</p>
                 <p className="text-xs font-bold text-gray-700 leading-relaxed">{tier.description?.split('(')[0]?.trim() || 'Accompagnement personnalisé'}</p>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-bold text-gray-600 px-3 py-2">
                <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span>{tier.maxCallDuration ? `${Math.floor(tier.maxCallDuration / 60)}h ${tier.maxCallDuration % 60 > 0 ? (tier.maxCallDuration % 60) + 'm' : ''}` : 'Illimité'} de consulting</span>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-bold text-gray-600 px-3 py-2">
                <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <span>{tier.maxMessages === null ? 'Support illimité' : `${tier.maxMessages} messages inclus`}</span>
              </div>
            </div>

            <button
              onClick={() => onSelect(tier)}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 ${
                isUltimate
                  ? 'bg-slate-900 text-white'
                  : isPremium
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-[#2B5A8E] text-white hover:bg-[#1d3d61]'
              }`}
            >
              Sélectionner →
            </button>
          </div>
        )
      })}
    </div>
  )
}
