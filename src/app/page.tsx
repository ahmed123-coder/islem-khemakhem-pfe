import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, CheckCircle2, Target, GraduationCap, Award, TrendingUp, Briefcase, Users, Shield, BarChart3, Quote } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'DSL Conseil - Cabinet de Conseil & Accompagnement',
  description: 'Transformez votre entreprise avec l\'excellence. Conseil en management, RH, qualité et performance.',
}

export default function Home() {
  return (
    <>
      <Hero />
      
      {/* Service Cards - Overlapping Hero */}
      <section className="-mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Management & Stratégie', desc: 'Pilotage stratégique et organisation' },
              { title: 'Ressources Humaines', desc: 'Recrutement et gestion des talents' },
              { title: 'Qualité & RSE', desc: 'Démarches qualité et certifications' },
              { title: 'Performance', desc: 'KPIs et optimisation des processus' }
            ].map((service, i) => (
              <Card key={i} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                  <p className="text-sm text-[#64748B] mb-4">{service.desc}</p>
                  <Link href="/services" className="text-[#2B5A8E] text-sm font-medium inline-flex items-center hover:gap-2 transition-all">
                    En savoir plus <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#F59E0B] font-semibold text-sm uppercase tracking-wide mb-4">POURQUOI NOUS CHOISIR</p>
              <h2 className="text-4xl font-serif font-bold mb-8">Un accompagnement d'excellence</h2>
              <div className="space-y-4">
                {[
                  'Diagnostics personnalisés et plans d\'action concrets',
                  'Équipe de consultants seniors certifiés',
                  'Plateforme digitale de suivi en temps réel',
                  'Méthodologies éprouvées et innovantes',
                  'Accompagnement de bout en bout'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
              <Button className="mt-8 bg-[#2B5A8E] hover:bg-[#234a73]">
                Nous contacter
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Target, title: 'Diagnostic', desc: 'Audit complet' },
                { icon: GraduationCap, title: 'Formation', desc: 'Ateliers pratiques' },
                { icon: Award, title: 'Certification', desc: 'ISO & normes' },
                { icon: TrendingUp, title: 'Performance', desc: 'KPIs & suivi' }
              ].map((item, i) => (
                <Card key={i} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-[#F59E0B]/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-6 w-6 text-[#F59E0B]" />
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-[#64748B]">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#2B5A8E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { value: '150+', label: 'Entreprises accompagnées' },
              { value: '95%', label: 'Taux de satisfaction' },
              { value: '12', label: 'Consultants experts' },
              { value: '8 ans', label: 'D\'expérience' }
            ].map((stat, i) => (
              <Card key={i} className="bg-white text-center">
                <CardContent className="p-6">
                  <div className="text-4xl font-serif font-bold text-[#2B5A8E] mb-2">{stat.value}</div>
                  <div className="text-[#64748B]">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#F59E0B] font-semibold text-sm uppercase tracking-wide mb-4">NOS EXPERTISES</p>
            <h2 className="text-4xl font-serif font-bold mb-4">Des solutions sur mesure</h2>
            <p className="text-[#64748B] max-w-3xl mx-auto">
              Nous intervenons sur quatre domaines clés pour optimiser la performance globale de votre entreprise.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Briefcase, title: 'Management & Stratégie', desc: 'Pilotage stratégique, organisation et transformation' },
              { icon: Users, title: 'Ressources Humaines', desc: 'Recrutement, formation, GPEC et développement RH' },
              { icon: Shield, title: 'Qualité & RSE', desc: 'Démarches qualité, certifications ISO, RSE et conformité' },
              { icon: BarChart3, title: 'Performance', desc: 'KPIs, tableaux de bord, optimisation des processus' }
            ].map((item, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-[#2B5A8E]/10 flex items-center justify-center mb-4">
                    <item.icon className="h-7 w-7 text-[#2B5A8E]" />
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-3">{item.title}</h3>
                  <p className="text-[#64748B] text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2B5A8E] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Prêt à transformer votre entreprise ?
          </h2>
          <p className="text-xl mb-10 text-white/90">
            Réservez un diagnostic gratuit avec l'un de nos consultants experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-[#F59E0B] hover:bg-[#ea8c00] text-white px-8 py-6 text-base">
              Réserver un diagnostic gratuit
            </Button>
            <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#2B5A8E] px-8 py-6 text-base">
              Nous contacter
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#F59E0B] font-semibold text-sm uppercase tracking-wide mb-4">TÉMOIGNAGES</p>
            <h2 className="text-4xl font-serif font-bold">Ils nous font confiance</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: 'DSL Conseil a transformé notre approche RH. Les résultats sont au-delà de nos attentes.', name: 'Marie Dupont', role: 'DRH, TechCorp' },
              { quote: 'Un accompagnement stratégique remarquable qui nous a permis de doubler notre chiffre d\'affaires.', name: 'Jean Martin', role: 'Dirigeant, PME Solutions' },
              { quote: 'Certification ISO obtenue en 6 mois grâce à leur méthodologie structurée et efficace.', name: 'Sophie Bernard', role: 'Responsable Qualité, IndusFrance' }
            ].map((testimonial, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Quote className="h-10 w-10 text-[#F59E0B]/30 mb-4" />
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex text-[#F59E0B] mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-[#64748B]">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}