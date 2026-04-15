'use client'

import { useState } from 'react'

interface PaymentModalProps {
  price: number
  tierName: string
  onSuccess: () => void
  onClose: () => void
}

export default function PaymentModal({ price, tierName, onSuccess, onClose }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardName, setCardName] = useState('')
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 16)
    return v.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 4)
    if (v.length >= 3) return v.slice(0, 2) + '/' + v.slice(2)
    return v
  }

  const getCardBrand = (num: string) => {
    const n = num.replace(/\s/g, '')
    if (n.startsWith('4')) return { name: 'Visa', icon: '💳' }
    if (n.startsWith('5')) return { name: 'Mastercard', icon: '💳' }
    return { name: 'Card', icon: '🔒' }
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentProcessing(true)
    setTimeout(() => {
      setPaymentProcessing(false)
      setPaymentSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-50 animate-in fade-in duration-500 overflow-y-auto py-10">
      <div className="bg-white rounded-[3rem] shadow-[0_50px_120px_rgba(0,0,0,0.3)] max-w-md w-full mx-4 overflow-hidden border border-white transform animate-in zoom-in-95 slide-in-from-bottom-10 duration-500" onClick={e => e.stopPropagation()}>
        <div className={`transition-all duration-700 ${paymentSuccess ? 'bg-green-600' : 'bg-[#2B5A8E]'} p-10 text-white relative overflow-hidden text-center`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          {paymentSuccess ? (
            <div className="relative z-10 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-black mb-2">Paiement Réussi !</h2>
              <p className="text-green-100 font-medium">Redirection...</p>
            </div>
          ) : (
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="text-left">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-2">Caisse Sécurisée</div>
                  <h2 className="text-3xl font-black tracking-tight">{Number(price).toFixed(0)}<span className="text-lg ml-0.5">€</span></h2>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-xl font-bold">&times;</button>
              </div>
              <div className="flex items-center gap-4 bg-black/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm text-left">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">💎</div>
                <div>
                  <div className="font-bold uppercase text-sm tracking-widest">{tierName}</div>
                  <div className="text-[10px] font-medium opacity-70">Accès Premium aux services de conseil</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!paymentSuccess && (
          <form onSubmit={handlePayment} className="p-10">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden border border-white/20 transform hover:scale-105 transition-transform duration-500">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mb-16 blur-2xl"></div>
                <div className="flex justify-between items-center mb-8">
                  <div className="w-12 h-9 bg-amber-400/90 rounded-lg shadow-inner flex items-center justify-center overflow-hidden">
                    <div className="w-10 h-6 border-y border-white/30"></div>
                  </div>
                  <div className="text-2xl font-bold opacity-80">{cardNumber ? getCardBrand(cardNumber)?.icon : '🔒'}</div>
                </div>
                <div className="text-xl tracking-[0.25em] font-mono mb-6 min-h-[1.75rem] text-center drop-shadow-md">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1">Détenteur</span>
                    <span className="text-xs font-bold uppercase tracking-widest truncate max-w-[140px]">{cardName || 'NOM PRENOM'}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1">Expiration</span>
                    <span className="text-xs font-mono font-bold">{cardExpiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-5">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="Numéro de carte"
                  maxLength={19}
                  required
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-mono transition-all outline-none"
                />
                <div className="grid grid-cols-2 gap-5">
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-mono transition-all outline-none text-center"
                  />
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="CVC"
                    maxLength={3}
                    required
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-mono transition-all outline-none text-center"
                  />
                </div>
                <input
                  type="text"
                  value={cardName}
                  onChange={e => setCardName(e.target.value.toUpperCase())}
                  placeholder="NOM COMPLET"
                  required
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 uppercase transition-all outline-none font-bold tracking-wider"
                />
              </div>

              <button
                type="submit"
                disabled={paymentProcessing}
                className="w-full bg-[#2B5A8E] hover:bg-[#1d3d61] disabled:opacity-50 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all mt-4 relative overflow-hidden group shadow-xl hover:shadow-2xl active:scale-95"
              >
                {paymentProcessing ? 'Sécurisation...' : 'Confirmer & Payer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
