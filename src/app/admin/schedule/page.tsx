'use client'

import { useEffect, useState } from 'react'

interface Reservation {
  id: string
  requestedDate: string
}

interface Consultant {
  id: string
  name: string
  reservations: Reservation[]
}

export default function SchedulePage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [days, setDays] = useState(7)

  useEffect(() => {
    fetch(`/api/consultants/schedule?startDate=${startDate}&days=${days}`)
      .then(r => r.json())
      .then(setConsultants)
  }, [startDate, days])

  const hours = Array.from({ length: 9 }, (_, i) => i + 9) // 9h to 17h
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    return d
  })

  const hasReservation = (consultantId: string, date: Date, hour: number) => {
    const consultant = consultants.find(c => c.id === consultantId)
    if (!consultant) return false
    
    return consultant.reservations.some(r => {
      const resDate = new Date(r.requestedDate)
      return resDate.getDate() === date.getDate() &&
             resDate.getMonth() === date.getMonth() &&
             resDate.getHours() === hour
    })
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Planning des Consultants</h1>
      
      <div className="mb-4 flex gap-4">
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <select
          value={days}
          onChange={e => setDays(parseInt(e.target.value))}
          className="border rounded px-3 py-2"
        >
          <option value="7">7 jours</option>
          <option value="14">14 jours</option>
          <option value="30">30 jours</option>
        </select>
      </div>

      {dates.map(date => (
        <div key={date.toISOString()} className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Heure</th>
                  {consultants.map(c => (
                    <th key={c.id} className="border p-2 text-center">{c.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map(hour => (
                  <tr key={hour}>
                    <td className="border p-2 font-medium">{hour}h - {hour + 1}h</td>
                    {consultants.map(c => (
                      <td
                        key={c.id}
                        className={`border p-2 text-center ${
                          hasReservation(c.id, date, hour)
                            ? 'bg-red-200 font-semibold'
                            : 'bg-green-50'
                        }`}
                      >
                        {hasReservation(c.id, date, hour) ? 'Réservé' : 'Libre'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
