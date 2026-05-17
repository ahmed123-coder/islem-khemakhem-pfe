import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Briefcase, Users, Shield, BarChart3, Quote } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'DSL Consulting - Cabinet de Conseil & Accompagnement',
  description: 'Transformez votre entreprise avec l\'excellence. Conseil en management, RH, qualité et performance.',
}

export default function Home() {
  return (
    <>
      <Hero />
      
      {/* DSL Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-3xl">🥇</span>
            <h2 className="text-4xl font-serif font-bold text-[#1B3F7A] mt-3 mb-3">Nos valeurs — Le sens de DSL</h2>
            <div className="w-16 h-1 bg-[#7AB648] mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                letter: 'D',
                title: 'Détermination',
                desc: 'Nous avançons avec rigueur et engagement vers l\'atteinte des objectifs de nos clients. Chaque projet est porté par une volonté de réussir, ensemble.'
              },
              {
                letter: 'S',
                title: 'Succès',
                desc: 'Le succès n\'est pas individuel : il naît de notre collaboration étroite avec nos clients. Il est le fruit d\'une détermination partagée et d\'actions concrètes orientées résultats.'
              },
              {
                letter: 'L',
                title: 'Loyauté',
                desc: 'Nous plaçons la confiance et la fidélité au cœur de nos relations. Nous sommes dévoués à nos clients et nous construisons des partenariats durables basés sur le respect et l\'intégrité.'
              }
            ].map((val) => (
              <div key={val.letter} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow text-center">
                <div className="w-16 h-16 rounded-full bg-[#1B3F7A] flex items-center justify-center mx-auto mb-5">
                  <span className="text-3xl font-bold text-white">{val.letter}</span>
                </div>
                <div className="w-10 h-1 bg-[#7AB648] mx-auto mb-4 rounded-full"></div>
                <h3 className="text-xl font-bold text-[#1B3F7A] mb-3">{val.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approches Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-3xl">🎯</span>
            <h2 className="text-4xl font-serif font-bold text-[#1B3F7A] mt-3 mb-3">Nos approches</h2>
            <div className="w-16 h-1 bg-[#7AB648] mx-auto rounded-full mb-6"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '👥',
                title: 'Coaching professionnel'
              },
              {
                icon: '🔄',
                title: 'Conduite du changement'
              },
              {
                icon: '📚',
                title: 'Formation & Sensibilisation'
              }
            ].map((approach, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-5">{approach.icon}</div>
                <div className="w-10 h-1 bg-[#7AB648] mb-4 rounded-full"></div>
                <h3 className="text-xl font-bold text-[#1B3F7A] mb-6">{approach.title}</h3>
                <Link href="/services">
                  <button className="text-[#7AB648] hover:text-[#639a3a] text-sm font-medium underline underline-offset-4 transition-colors">
                    En savoir plus →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos Solutions Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-3xl">💡</span>
            <h2 className="text-4xl font-serif font-bold text-[#1B3F7A] mt-3 mb-3">Nos solutions</h2>
            <div className="w-16 h-1 bg-[#7AB648] mx-auto rounded-full mb-6"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Management de la performance cachée'
              },
              {
                icon: '📊',
                title: 'Gestion prévisionnelle des emplois et des compétences'
              },
              {
                icon: '⭐',
                title: 'Marque employeur'
              }
            ].map((solution, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-5">{solution.icon}</div>
                <div className="w-10 h-1 bg-[#7AB648] mb-4 rounded-full"></div>
                <h3 className="text-xl font-bold text-[#1B3F7A] mb-6">{solution.title}</h3>
                <Link href="/services">
                  <button className="text-[#7AB648] hover:text-[#639a3a] text-sm font-medium underline underline-offset-4 transition-colors">
                    En savoir plus →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose DSL */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-10">
                <h2 className="text-3xl font-serif font-bold text-[#1B3F7A] mb-3">🏆 Pourquoi choisir DSL</h2>
                <div className="w-16 h-1 bg-[#7AB648] rounded-full"></div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-8">
                La différence entre une organisation qui évolue et celle qui stagne ne réside pas uniquement dans ses ressources, mais dans sa capacité à mobiliser les bonnes expertises au bon moment. C'est pour répondre à cette exigence que notre plateforme a été conçue, ça vous sera utile pour :
              </p>
              <div className="space-y-3 max-w-2xl">
                {[
                  'Piloter votre performance avec plus de clarté et d\'efficacité',
                  'Optimiser vos ressources et maîtriser vos défis et vos goulots',
                  'Bénéficier de solutions concrètes, bien adaptées à vos enjeux',
                  'Accéder rapidement à des experts rigoureusement sélectionnés'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[#7AB648] text-sm">✔️</span>
                    <p className="text-gray-700 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-lg">
              <Image src="/pourquoi nous choisir.png" alt="Pourquoi choisir DSL" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden" style={{background: 'linear-gradient(135deg, #1B3F7A 0%, #1a6b6b 100%)'}}>
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <span className="text-white font-bold" style={{fontSize: '20rem', letterSpacing: '-0.05em'}}>DSL</span>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white mb-6 whitespace-nowrap">
            Accédez directement à nos approches spécialisés.
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Choisissez la solution adaptée à vos besoins uniques ou connectez-vous pour un accompagnement sur mesure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button className="bg-white hover:bg-gray-100 text-[#1B3F7A] rounded-full px-8 py-6 text-base font-bold">
                Créer un Compte
              </Button>
            </Link>
            <Link href="/services">
              <Button className="bg-[#7AB648] hover:bg-[#639a3a] text-white rounded-full px-8 py-6 text-base font-bold">
                Consulter nos domaines →
              </Button>
            </Link>
            
            <Link href="/contact" className="text-white/70 hover:text-white underline underline-offset-4 text-base font-medium transition-colors">
              Nous contacter →
            </Link>
          </div>
        </div>

      </section>


    </>
  )
}