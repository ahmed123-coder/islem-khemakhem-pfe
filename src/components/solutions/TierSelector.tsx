'use client'

interface ServiceTier {
  id: string
  name: string
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {tiers.map((tier) => {
        const type = tier.tierType || tier.name || ''
        const isPremium = type === 'PREMIUM' || tier.name?.toLowerCase().includes('premium')
        
        return (
          <div 
            key={tier.id} 
            className={`relative bg-white rounded-[2.5rem] border-2 ${getTierBorder(type)} p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group`}
          >
            {isPremium && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-1.5 rounded-full shadow-lg border-2 border-white">
                Populaire
              </div>
            )}
            <div className={`bg-gradient-to-br ${getTierColor(type)} text-white rounded-3xl p-6 mb-8 text-center shadow-lg transform group-hover:scale-105 transition-transform duration-500`}>
              <div className="text-4xl mb-2">{getTierIcon(type)}</div>
              <h4 className="text-xl font-bold uppercase tracking-wider">{type}</h4>
            </div>
            
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-1">
                <span className="text-5xl font-black text-gray-900 tracking-tight">{Number(tier.price).toFixed(0)}</span>
                <span className="text-xl text-gray-400 font-bold self-start mt-2">€</span>
              </div>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              <div className="flex items-center gap-4 text-sm font-medium text-gray-600 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>{tier.messageLimit || tier.maxMessages || 10} messages inclus</span>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-gray-600 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>{tier.callLimit || tier.maxCallDuration || 30} min d'appels</span>
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
              onClick={() => onSelect(tier)}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 ${
                isPremium
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'bg-[#2B5A8E] text-white hover:bg-[#1d3d61]'
              }`}
            >
              Choisir cette offre →
            </button>
          </div>
        )
      })}
    </div>
  )
}
