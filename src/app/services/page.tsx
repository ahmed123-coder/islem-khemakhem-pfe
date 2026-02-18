import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Services - DSL Conseil',
  description: 'Des expertises au service de votre performance',
}

async function getServices() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/services`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const services = [
  {
    icon: '💼',
    title: 'Management & Stratégie',
    description: 'Accompagnement des dirigeants dans le pilotage stratégique, l\'organisation et la gouvernance de leur entreprise.',
    features: ['Diagnostic stratégique', 'Coaching de direction', 'Plan de développement', 'Conduite du changement']
  },
  {
    icon: '👥',
    title: 'Ressources Humaines',
    description: 'Optimisation de la gestion des talents, du recrutement à la fidélisation, en passant par la GPEC.',
    features: ['Audit RH', 'GPEC & Mobilité', 'Recrutement', 'Formation']
  },
  {
    icon: '🛡️',
    title: 'Qualité & RSE',
    description: 'Mise en place de démarches qualité, certifications et intégration de la responsabilité sociétale.',
    features: ['Certification ISO 9001', 'Audit qualité', 'Démarche RSE', 'Amélioration continue']
  },
  {
    icon: '📈',
    title: 'Performance',
    description: 'Conception de tableaux de bord, définition de KPIs et optimisation des processus.',
    features: ['Tableaux de bord', 'KPIs', 'Optimisation processus', 'Analyse performance']
  }
]

const methodology = [
  {
    number: 1,
    icon: '🎯',
    title: 'Diagnostic',
    description: 'Audit complet de votre organisation et identification des axes d\'amélioration.'
  },
  {
    number: 2,
    icon: '📋',
    title: 'Plan d\'action',
    description: 'Élaboration d\'un plan d\'action personnalisé avec des objectifs mesurables.'
  },
  {
    number: 3,
    icon: '🎓',
    title: 'Accompagnement',
    description: 'Mise en œuvre, formation des équipes et transfert de compétences.'
  },
  {
    number: 4,
    icon: '📊',
    title: 'Suivi & Mesure',
    description: 'Pilotage des résultats et ajustements pour garantir la pérennité.'
  }
]

export default async function Services() {
  const services = await getServices();

  if (!services.length) {
    return <div className="py-20 text-center">No services available</div>;
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
            <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6">
                  {service.icon}
                </div>
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                  {service.title}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                {service.features && Array.isArray(service.features) && (
                  <ul className="grid grid-cols-2 gap-3 mb-6">
                    {service.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-700">
                        <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link 
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-[#2B5A8E] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#234a73] transition-all"
                >
                  Demander un devis
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className={`bg-gray-200 rounded-2xl h-80 flex items-center justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="text-8xl opacity-20">{service.icon}</div>
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
            {methodology.map((step, index) => (
              <div key={index} className="relative">
                {index < methodology.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5">
                    <div className="flex items-center justify-center">
                      <div className="w-12 h-12 bg-[#F59E0B] rounded-full flex items-center justify-center text-white font-bold">
                        {step.number}
                      </div>
                    </div>
                  </div>
                )}
                <div className="text-center">
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
