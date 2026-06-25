'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

export default function Services() {
  const router = useRouter()
  const { locale } = useParams() as { locale: string }
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [heroData, setHeroData] = useState<any>(null)

  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/services', { cache: 'no-store' }).then(res => res.json()),
      fetch('/api/content/hero-solutions', { cache: 'no-store' }).then(res => res.ok ? res.json() : null),
      fetch('/api/reviews', { cache: 'no-store' }).then(res => res.ok ? res.json() : [])
    ])
      .then(([servicesData, heroJSON, reviewsData]) => {
        setServices(servicesData)
        const heroVal = heroJSON?.data?.value || heroJSON?.value;
        if (heroVal) {
          setHeroData(heroVal)
        }
        // If reviewsData is the standard response structure { success: true, data: [...] }
        if (reviewsData && reviewsData.data) {
          setReviews(reviewsData.data)
        } else if (Array.isArray(reviewsData)) {
          setReviews(reviewsData)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2B5A8E] border-t-transparent rounded-full animate-spin"></div>
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
                        <img src={service.icon || service.logo} alt={service.name} className="w-50 h-10 object-contain relative z-10 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    {service.category && (
                      <div className="inline-block bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-4 shadow-sm">
                        {service.category}
                      </div>
                    )}
                    <h2 className="text-4xl font-serif font-extrabold text-gray-900 mb-4 leading-tight group-hover:text-[#2B5A8E] transition-colors duration-300">
                      {service.name}
                    </h2>
                    
                    {/* Rating Badge */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-1 rounded-lg border border-amber-100 font-bold text-sm">
                        <span className="text-amber-500 mr-1.5">★</span>
                        {service.avgRating > 0 ? service.avgRating.toFixed(1) : '5.0'}
                      </div>
                      <span className="text-gray-400 text-sm font-medium">
                        ({service.reviewCount || 0} avis clients)
                      </span>
                    </div>
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                      {service.description}
                    </p>
                    <button 
                      onClick={() => router.push(`/${locale}/solutions/${service.id}`)}
                      className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold bg-[#2B5A8E] text-white hover:bg-[#1d3d61] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                    >
                      En savoir plus & Réserver
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                  <div 
                    onClick={() => router.push(`/${locale}/solutions/${service.id}`)}
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
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#7AB648]/10 rounded-full mb-4">
              <span className="text-2xl">⭐</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[#1B3F7A] mb-4">Ce que nos clients disent</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg mb-6">Découvrez les retours d'expérience de ceux qui nous font confiance pour leur transformation.</p>
            <div className="w-24 h-1.5 bg-[#7AB648] mx-auto rounded-full"></div>
          </div>
          
          {reviews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review, i) => (
                <div key={review.id || i} className="bg-[#f8faff] rounded-[2rem] p-10 border border-blue-50 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col group">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className={`text-xl ${j < review.rating ? 'text-[#7AB648]' : 'text-gray-200'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="relative flex-grow">
                    <span className="absolute -top-4 -left-2 text-6xl text-[#7AB648]/10 font-serif leading-none">“</span>
                    <p className="text-gray-700 italic leading-relaxed mb-8 text-base relative z-10 line-clamp-6 group-hover:line-clamp-none transition-all duration-500">
                      {review.comment || "Aucun commentaire laissé, mais une excellente expérience globale avec nos services."}
                    </p>
                  </div>
                  <div className="mt-auto pt-8 border-t border-blue-100/50 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#2B5A8E] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                      {review.client?.firstName?.[0] || review.client?.name?.[0] || 'C'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1B3F7A] tracking-tight">
                        {review.client?.firstName} {review.client?.name}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">
                        Client DSL {review.service?.name || review.order?.serviceTier?.service?.name ? `• ${review.service?.name || review.order?.serviceTier?.service?.name}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
              <div className="text-6xl mb-6 grayscale opacity-20">💬</div>
              <h3 className="text-2xl font-bold text-gray-400">Aucun avis pour le moment</h3>
              <p className="text-gray-400 mt-2">Revenez bientôt pour lire les témoignages de nos clients.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
