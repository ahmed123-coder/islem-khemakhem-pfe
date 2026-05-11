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
        className="relative bg-[#2B4F8A] text-white overflow-hidden min-h-[400px]"
        style={heroData?.image 
          ? { backgroundImage: `url(${heroData.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
          : { backgroundImage: `url('/solutionHero.jpeg')`, backgroundSize: 'cover', backgroundPosition: 'center' }
        }
      >
        <div className="absolute inset-0  bg-[#2B4F8A]/80 mix-blend-multiply" /> 
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight tracking-tight text-white">
              {heroData?.title || 'Nos Solutions'}
              <div className="w-22 h-1 bg-[#7AB648] rounded-full mt-4"></div>
            </h1>
            <p className="text-lg text-white/90 leading-relaxed border-l-4 border-[#7AB648] pl-4 whitespace-pre-line">
              {heroData?.subtitle || 'Des expertises au service de votre performance pour une transformation globale et pérenne de votre entreprise.'}
            </p>
          </div>
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

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-3xl">⭐</span>
            <h2 className="text-4xl font-serif font-bold text-[#1B3F7A] mt-3 mb-3">Ce que nos clients disent</h2>
            <div className="w-16 h-1 bg-[#7AB648] mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Ahmed Khalil',
                role: 'Directeur Général, Groupe Industriel',
                testimonial: 'DSL a transformé notre approche du management. En 6 mois, nous avons identifié et résolu les dysfonctionnements invisibles qui freinaient notre croissance. Un partenariat stratégique vrai.',
                rating: 5
              },
              {
                name: 'Fatima Ben Ali',
                role: 'RH Manager, Entreprise Technologique',
                testimonial: 'L\'expertise en gestion des talents et conduite du changement de DSL a été déterminante pour notre transformation digitale. Les équipes sont plus engagées que jamais.',
                rating: 5
              },
              {
                name: 'Mohamed Zahra',
                role: 'Directeur Planning, PME Services',
                testimonial: 'Les solutions personnalisées et l\'accompagnement opérationnel de DSL ont dépassé nos attentes. Nos KPIs ont augmenté de 40% en 12 mois. Fortement recommandé.',
                rating: 5
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <span key={j} className="text-[#7AB648] text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-700 italic leading-relaxed mb-6 text-sm">
                  "{testimonial.testimonial}"
                </p>
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-bold text-[#1B3F7A]">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
