'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Services() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="py-20 text-center">Loading...</div>
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#2B5A8E] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-[#F59E0B]/20 text-[#FCD34D] px-4 py-2 rounded-full text-sm font-medium mb-6">
            Nos Services
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 max-w-4xl">
            Des expertises au service de votre performance
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Découvrez nos services avec des offres adaptées à vos besoins.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {services.map((service: any, index: number) => (
            <div key={service.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  {service.category && (
                    <div className="mb-4">
                      <img src={service.category} alt={service.name} className="w-16 h-16 object-cover rounded-lg" />
                    </div>
                  )}
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                    {service.name}
                  </h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <div className={`bg-gray-50 rounded-xl p-6 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Offres disponibles</h3>
                  <div className="space-y-3">
                    {service.tiers?.map((tier: any) => (
                      <div key={tier.id} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-lg text-blue-700">{tier.tierType}</span>
                          <span className="text-2xl font-bold text-gray-900">${tier.price}</span>
                        </div>
                        {tier.description && <p className="text-sm text-gray-600 mb-2">{tier.description}</p>}
                        <div className="text-sm text-gray-500 space-y-1">
                          {tier.maxMessages && <p>✓ {tier.maxMessages} messages</p>}
                          {tier.maxCallDuration && <p>✓ {tier.maxCallDuration} min d'appel</p>}
                          {tier.canSelectConsultant && <p>✓ Choix du consultant</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#2B5A8E] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Besoin d'un accompagnement personnalisé ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Contactez-nous pour un diagnostic gratuit de votre organisation.
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            Nous contacter
          </Link>
        </div>
      </section>
    </div>
  )
}
