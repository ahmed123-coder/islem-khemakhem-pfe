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
            Quatre domaines d'intervention complémentaires pour une transformation globale de votre entreprise.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {services.map((service: any, index: number) => (
            <div key={service.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                {service.category && (
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                    <img src={service.category} alt={service.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                  {service.name}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <Link 
                  href={`/client/services?serviceId=${service.id}`}
                  className="inline-flex items-center gap-2 bg-[#2B5A8E] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#234a73] transition-all"
                >
                  Demander un devis
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className={`bg-gray-200 rounded-2xl h-80 flex items-center justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                {service.category ? (
                  <img src={service.category} alt={service.name} className="w-32 h-32 object-cover opacity-30" />
                ) : (
                  <div className="text-8xl opacity-20">📊</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              NOTRE MÉTHODOLOGIE
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
              Un processus éprouvé en 4 étapes
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: 1, icon: '🎯', title: 'Diagnostic', description: 'Audit complet de votre organisation et identification des axes d\'amélioration.' },
              { number: 2, icon: '📋', title: 'Plan d\'action', description: 'Élaboration d\'un plan d\'action personnalisé avec des objectifs mesurables.' },
              { number: 3, icon: '🎓', title: 'Accompagnement', description: 'Mise en œuvre, formation des équipes et transfert de compétences.' },
              { number: 4, icon: '📊', title: 'Suivi & Mesure', description: 'Pilotage des résultats et ajustements pour garantir la pérennité.' }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-50 rounded-full text-4xl mb-6 border-4 border-white shadow-sm">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
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
            Réserver un créneau
          </Link>
        </div>
      </section>
    </div>
  )
}
