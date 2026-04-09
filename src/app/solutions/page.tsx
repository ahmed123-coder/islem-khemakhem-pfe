import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Nos Solutions - DSL Conseil',
  description: 'Découvrez nos solutions à forte valeur ajoutée : Management de la performance cachée, Gestion prévisionnelle des emplois, Marque employeur.',
}

export default function SolutionsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#2B4F8A] text-white overflow-hidden min-h-[400px]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600')] bg-cover opacity-20" style={{backgroundPosition: 'center 30%'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight tracking-tight text-white">
              Nos solutions
              <div className="w-22 h-1 bg-[#7AB648] rounded-full mt-4"></div>
            </h1>
            <p className="text-lg text-white/90 leading-relaxed border-l-4 border-[#7AB648] pl-4">
              Découvrez comment DSL vous assiste à libérer le potentiel de votre organisation, en transformant vos défis à des résultats concrets source de performance et de durabilité grâce à des solutions personnalisées et spécifiques.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif font-bold text-[#1B3F7A] mb-3">Nos solutions à forte valeur ajoutée</h2>
            <div className="w-16 h-1 bg-[#7AB648] mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Management de la performance cachée',
                desc: 'Nous identifions les dysfonctionnements invisibles qui freinent la performance et transformons les coûts cachés en valeur durable, grâce à une analyse approfondie des pratiques organisationnelles, à l\'optimisation de la performance socio-économique et à la valorisation du capital humain comme levier stratégique.',
                benefits: [
                  'Identification des dysfonctionnements invisibles',
                  'Analyse approfondie des pratiques organisationnelles',
                  'Optimisation de la performance socio-économique',
                  'Valorisation du capital humain'
                ]
              },
              {
                icon: '📊',
                title: 'Gestion prévisionnelle des emplois et des compétences',
                desc: 'Nous accompagnons la construction de trajectoires professionnelles alignées avec la stratégie de l\'entreprise, en cartographiant les compétences, en définissant des plans de développement et d\'évolution de carrière, et en assurant une gestion proactive des talents pour renforcer l\'impact des collaborateurs.',
                benefits: [
                  'Cartographie des compétences',
                  'Trajectoires professionnelles alignées',
                  'Plans de développement personnalisés',
                  'Gestion proactive des talents'
                ]
              },
              {
                icon: '⭐',
                title: 'Marque employeur',
                desc: 'Nous renforçons l\'attractivité et la fidélisation en créant une expérience collaborateur cohérente et engageante, en développant un positionnement employeur différenciant, des stratégies d\'engagement et de fidélisation, et en valorisant la culture d\'entreprise comme facteur clé de performance durable.',
                benefits: [
                  'Expérience collaborateur engageante',
                  'Positionnement employeur différenciant',
                  'Stratégies d\'engagement et fidélisation',
                  'Culture d\'entreprise comme levier'
                ]
              }
            ].map((solution, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-5">{solution.icon}</div>
                <div className="w-10 h-1 bg-[#7AB648] mb-4 rounded-full"></div>
                <h3 className="text-2xl font-bold text-[#1B3F7A] mb-4">{solution.title}</h3>
                <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                  {solution.desc}
                </p>
                <div className="space-y-2 mb-6">
                  {solution.benefits.map((benefit, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <span className="text-[#7AB648] mt-1 flex-shrink-0">✔️</span>
                      <p className="text-gray-600 text-sm">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-[#1B3F7A] mb-6">Transformez vos défis en succès</h2>
          <div className="w-16 h-1 bg-[#7AB648] mx-auto rounded-full mb-8"></div>
          <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
            Nos solutions sont conçues pour créer une valeur durable et mesurable dans votre organisation. Parlons de vos enjeux spécifiques.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="bg-[#7AB648] hover:bg-[#639a3a] text-white rounded-lg px-8 py-6 text-base font-semibold">
                Nous contacter →
              </Button>
            </Link>
            <Link href="/">
              <Button className="bg-white text-[#1B3F7A] hover:bg-gray-100 rounded-lg px-8 py-6 text-base font-semibold border-2 border-[#1B3F7A]">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
