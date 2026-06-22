'use client'

interface MeetingTypeModalProps {
  onConfirm: (type: 'ZOOM' | 'SUR_PLACE') => void
  onClose: () => void
  serviceName?: string
  tierName?: string
}

export default function MeetingTypeModal({ onConfirm, onClose, serviceName, tierName }: MeetingTypeModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm mx-4 p-6 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-black text-gray-900 mb-2 text-center">Type de réunion</h2>
        <p className="text-gray-500 text-center mb-8">
          {serviceName && tierName ? `${serviceName} — ${tierName}` : 'Comment souhaitez-vous échanger ?'}
        </p>
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => onConfirm('ZOOM')} 
            className="flex items-center gap-4 p-4 border-2 border-blue-100 rounded-[1.5rem] hover:border-blue-600 hover:bg-blue-50/50 transition-all group text-left shadow-sm hover:shadow-lg font-bold"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">🎥</div>
            <div className="flex-1">
              <span className="block font-black text-gray-900 group-hover:text-blue-600">Visioconférence Zoom</span>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Réunion à distance</span>
            </div>
          </button>
          <button 
            onClick={() => onConfirm('SUR_PLACE')} 
            className="flex items-center gap-4 p-4 border-2 border-green-100 rounded-[1.5rem] hover:border-green-600 hover:bg-green-50/50 transition-all group text-left shadow-sm hover:shadow-lg font-bold"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">🏢</div>
            <div className="flex-1">
              <span className="block font-black text-gray-900 group-hover:text-green-600">Rencontre sur place</span>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Réunion physique</span>
            </div>
          </button>
        </div>
        <button onClick={onClose} className="mt-6 w-full text-xs font-black text-gray-400 hover:text-gray-900 tracking-widest uppercase transition-colors">
          Annuler
        </button>
      </div>
    </div>
  )
}
