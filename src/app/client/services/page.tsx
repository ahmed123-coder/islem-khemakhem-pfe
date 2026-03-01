'use client'

import { useEffect, useState } from 'react'

interface ServiceTier {
  id: string
  name: string
  price: number
  messageLimit: number
  callLimit: number
}

interface Service {
  id: string
  name: string
  description: string
  tiers: ServiceTier[]
}

interface Reservation {
  id: string
  startTime: string
  endTime: string
}

interface Consultant {
  id: string
  name: string
  reservations: Reservation[]
}

export default function ServicesPage() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedTier, setSelectedTier] = useState<ServiceTier | null>(null)
  const [selectedConsultant, setSelectedConsultant] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number>(1)

  useEffect(() => {
    fetch('/api/services/with-tiers').then(r => r.json()).then(setServices)
  }, [])

  useEffect(() => {
    if (step === 3) {
      const startDate = new Date().toISOString().split('T')[0]
      fetch(`/api/consultants/schedule?startDate=${startDate}&days=7`)
        .then(r => r.json())
        .then(data => {
          console.log('Schedule data:', data)
          if (Array.isArray(data)) {
            setConsultants(data)
          } else {
            console.error('Invalid data:', data)
            setConsultants([])
          }
        })
        .catch(err => {
          console.error('Fetch error:', err)
          setConsultants([])
        })
    }
  }, [step])

  const hours = Array.from({ length: 9 }, (_, i) => i + 9)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  const isSlotBlocked = (consultantId: string, date: Date, hour: number, duration: number = 1) => {
    const consultant = consultants.find(c => c.id === consultantId)
    if (!consultant) return false
    
    const slotStart = new Date(date)
    slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = new Date(slotStart)
    slotEnd.setHours(hour + duration, 0, 0, 0)
    
    return consultant.reservations.some(r => {
      const resStart = new Date(r.startTime)
      const resEnd = new Date(r.endTime)
      
      return (slotStart < resEnd && slotEnd > resStart)
    })
  }

  const handlePurchase = async () => {
    if (!selectedTier || !selectedConsultant || !selectedDate || selectedStartHour === null) return

    const startTime = new Date(selectedDate)
    startTime.setHours(selectedStartHour, 0, 0, 0)
    const endTime = new Date(startTime)
    endTime.setHours(selectedStartHour + selectedDuration, 0, 0, 0)

    const res = await fetch('/api/client/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceTierId: selectedTier.id,
        consultantId: selectedConsultant,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      })
    })

    if (res.ok) {
      alert('Commande créée avec succès!')
      setStep(1)
      setSelectedService(null)
      setSelectedTier(null)
      setSelectedConsultant('')
      setSelectedDate(null)
      setSelectedStartHour(null)
      setSelectedDuration(1)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Nos Services</h1>

      {step === 3 && consultants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg">Chargement des consultants...</p>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4">
          {services.map(service => (
            <div key={service.id} className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <button
                onClick={() => {
                  setSelectedService(service)
                  setStep(2)
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Choisir
              </button>
            </div>
          ))}
        </div>
      )}

      {step === 2 && selectedService && (
        <div>
          <button onClick={() => setStep(1)} className="mb-4 text-blue-600">← Retour</button>
          <h2 className="text-2xl font-semibold mb-4">{selectedService.name}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {selectedService.tiers.map(tier => (
              <div key={tier.id} className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">{tier.name}</h3>
                <p className="text-3xl font-bold mb-4">{tier.price}€</p>
                <p className="text-sm text-gray-600 mb-2">{tier.messageLimit} messages</p>
                <p className="text-sm text-gray-600 mb-4">{tier.callLimit} appels</p>
                <button
                  onClick={() => {
                    setSelectedTier(tier)
                    setStep(3)
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Continuer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && consultants.length > 0 && (
        <div>
          <button onClick={() => setStep(2)} className="mb-6 text-blue-600 hover:underline">← Retour</button>
          <h2 className="text-2xl font-bold mb-4">Sélectionnez votre créneau</h2>
          
          <div className="mb-6 flex items-center gap-4">
            <label className="font-semibold">Durée:</label>
            <select 
              value={selectedDuration} 
              onChange={e => setSelectedDuration(parseInt(e.target.value))}
              className="border rounded px-4 py-2"
            >
              <option value="1">1 heure</option>
              <option value="2">2 heures</option>
              <option value="3">3 heures</option>
              <option value="4">4 heures</option>
            </select>
          </div>
          
          <div className="grid gap-8">
            {Array.isArray(consultants) && consultants.map(consultant => (
              <div key={consultant.id} className="border-2 rounded-xl p-6 shadow-lg bg-white">
                <h3 className="text-xl font-bold mb-4 text-blue-600">{consultant.name}</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <th className="border border-blue-400 p-3 text-left font-semibold">Date</th>
                        {hours.map(h => (
                          <th key={h} className="border border-blue-400 p-3 text-center font-semibold text-sm">
                            {h}h
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dates.map(date => (
                        <tr key={date.toISOString()} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                            <div className="text-sm">{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                            <div className="text-xs text-gray-600">{date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                          </td>
                          {hours.map(hour => {
                            const blocked = isSlotBlocked(consultant.id, date, hour, selectedDuration)
                            const isSelected = selectedConsultant === consultant.id && 
                                             selectedDate?.getDate() === date.getDate() && 
                                             selectedStartHour === hour
                            
                            return (
                              <td
                                key={hour}
                                onClick={() => {
                                  if (!blocked) {
                                    setSelectedConsultant(consultant.id)
                                    setSelectedDate(date)
                                    setSelectedStartHour(hour)
                                  }
                                }}
                                className={`border border-gray-300 p-2 text-center text-sm font-medium transition-all ${
                                  blocked 
                                    ? 'bg-red-100 text-red-700 cursor-not-allowed' 
                                    : isSelected 
                                    ? 'bg-green-500 text-white shadow-md scale-105 cursor-pointer' 
                                    : 'bg-green-50 hover:bg-green-100 cursor-pointer hover:shadow-sm'
                                }`}
                              >
                                {blocked ? '✕' : isSelected ? '✓' : '○'}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {selectedConsultant && selectedDate && selectedStartHour !== null && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-green-500 p-4 shadow-2xl">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-semibold">Sélection:</span> {consultants.find(c => c.id === selectedConsultant)?.name} - {selectedDate.toLocaleDateString('fr-FR')} de {selectedStartHour}h à {selectedStartHour + selectedDuration}h
                </div>
                <button
                  onClick={handlePurchase}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Confirmer la réservation
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
