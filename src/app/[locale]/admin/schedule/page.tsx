'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

interface Reservation {
  id: string
  requestedDate: string
}

interface Consultant {
  id: string
  firstName?: string
  name: string
  reservations: Reservation[]
}

export default function SchedulePage() {
  const t = useTranslations("adminPage.schedule")
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [days, setDays] = useState(7)

  useEffect(() => {
    fetch(`/api/consultants/schedule?startDate=${startDate}&days=${days}`)
      .then(r => r.json())
      .then(res => {
        const data = res.data || res
        setConsultants(Array.isArray(data) ? data : [])
      })
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
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      
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
          <option value="7">{t("days.7")}</option>
          <option value="14">{t("days.14")}</option>
          <option value="30">{t("days.30")}</option>
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
                  <th className="border p-2 text-left">{t("columns.hour")}</th>
                  {consultants.map(c => (
                    <th key={c.id} className="border p-2 text-center">{[c.firstName, c.name].filter(Boolean).join(' ')}</th>
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
                        {hasReservation(c.id, date, hour) ? t("status.reserved") : t("status.free")}
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
