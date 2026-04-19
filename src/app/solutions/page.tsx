'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Services() {
  const router = useRouter()
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [heroData, setHeroData] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(res => res.json()),
      fetch('/api/content/hero-solutions').then(res => res.ok ? res.json() : null)
    ])
      .then(([data, heroJSON]) => {
        setServices(data)
        if (heroJSON && heroJSON.value) {
          setHeroData(heroJSON.value)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium tracking-tight">Chargement des solutions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="bg-[#2B5A8E] text-white py-20 relative bg-cover bg-center"
        style={heroData?.image ? { backgroundImage: `url(${heroData.image})` } : {}}
      >
        {heroData?.image && <div className="absolute inset-0 bg-[#2B5A8E]/80 mix-blend-multiply" />}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-block bg-[#F59E0B]/20 text-[#FCD34D] px-4 py-2 rounded-full text-sm font-medium mb-6">
            Nos Solutions
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 max-w-4xl">
            {heroData?.title || 'Des expertises au service de votre performance'}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl leading-relaxed whitespace-pre-line">
            {heroData?.subtitle || 'Quatre domaines d\'intervention complémentaires pour une transformation globale et pérenne de votre entreprise.'}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {services.map((service: any, index: number) => {
            return (
              <div key={service.id} className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center group ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    {(service.icon || service.logo) && (
                      <div className="w-20 h-20 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex items-center justify-center mb-8 overflow-hidden group-hover:-translate-y-1 transition-transform duration-500 relative">
                        <div className="absolute inset-0 bg-blue-50/50 group-hover:bg-blue-50/0 transition-colors duration-500"></div>
                        <img src={service.icon || service.logo} alt={service.name} className="w-12 h-12 object-contain relative z-10 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    {service.category && (
                      <div className="inline-block bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-4 shadow-sm">
                        {service.category}
                      </div>
                    )}
                    <h2 className="text-4xl font-serif font-extrabold text-gray-900 mb-6 leading-tight group-hover:text-[#2B5A8E] transition-colors duration-300">
                      {service.name}
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                      {service.description}
                    </p>
                    <button 
                      onClick={() => router.push(`/solutions/${service.id}`)}
                      className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold bg-[#2B5A8E] text-white hover:bg-[#1d3d61] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                    >
                      En savoir plus & Réserver
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                  <div 
                    onClick={() => router.push(`/solutions/${service.id}`)}
                    className={`relative h-[300px] sm:h-[400px] w-full rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgb(0,0,0,0.1)] group-hover:shadow-[0_20px_50px_rgb(43,90,142,0.15)] transition-shadow duration-500 cursor-pointer ${index % 2 === 1 ? 'lg:order-1' : ''}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    {service.image || service.logo ? (
                      <img src={service.image || service.logo} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <div className="text-8xl opacity-10 drop-shadow-sm">📊</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              NOTRE MÉTHODOLOGIE
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Un processus éprouvé en 4 étapes
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-medium">Une approche structurée pour garantir le succès de votre projet.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: 1, icon: '🎯', title: 'Diagnostic', description: 'Audit complet de votre organisation et identification des axes d\'amélioration.' },
              { number: 2, icon: '📋', title: 'Plan d\'action', description: 'Élaboration d\'un plan d\'action personnalisé avec des objectifs mesurables.' },
              { number: 3, icon: '🎓', title: 'Accompagnement', description: 'Mise en œuvre, formation des équipes et transfert de compétences.' },
              { number: 4, icon: '📊', title: 'Suivi & Mesure', description: 'Pilotage des résultats et ajustements pour garantir la pérennité.' }
            ].map((step, index) => (
              <div key={index} className="text-center group p-6 rounded-3xl hover:bg-gray-50 transition-colors duration-500">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-50 rounded-full text-4xl mb-6 border-4 border-white shadow-sm group-hover:scale-110 transition-transform duration-500">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#2B5A8E] text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full -mr-48 -mb-48 blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Besoin d&apos;un accompagnement personnalisé ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Contactez-nous pour un diagnostic gratuit de votre organisation et découvrez comment nous pouvons vous aider.
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-[#F59E0B] hover:bg-[#D97706] text-white font-black uppercase tracking-widest px-10 py-5 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95"
          >
            Réserver un créneau
          </Link>
        </div>
      </section>
    </div>
  )
}
