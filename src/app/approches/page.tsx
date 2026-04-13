import type { Metadata } from 'next'
import { CheckCircle2, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Nos Approches - DSL Conseil',
  description: 'Découvrez nos trois approches complémentaires : Coaching professionnel, Conduite du changement, Formation & Sensibilisation.',
}

async function getFaqs() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/faqs`, { cache: 'no-store' });
    if (!res.ok) return [];
    const faqs = await res.json();
    return faqs.filter((faq: any) => faq.isActive);
  } catch (error) {
    console.error("Fetch faqs error:", error);
    return [];
  }
}

export default async function ApprochesPage() {
  const faqs = await getFaqs();

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#2B4F8A] text-white overflow-hidden min-h-[400px]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600')] bg-cover opacity-20" style={{backgroundPosition: 'center 30%'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight tracking-tight text-white">
              Nos approches
              <div className="w-22 h-1 bg-[#7AB648] rounded-full mt-4"></div>
            </h1>
            <p className="text-lg text-white/90 leading-relaxed border-l-4 border-[#7AB648] pl-4">
              Depuis 2018, nous accompagnons les entreprises dans le renforcement de la réussite de leurs projets, grâce à trois approches complémentaires.
            </p>
          </div>
        </div>
      </section>

      {/* Approches Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '👥',
                title: 'Coaching professionnel',
                desc: 'Nous proposons un accompagnement ciblé pour libérer votre potentiel. Coaching individuel ou d\'équipes, développement du leadership et accompagnement des transitions professionnelles : tout est pensé pour favoriser l\'engagement, la performance et la réussite durable.',
                benefits: [
                  'Coaching individuel et d\'équipes',
                  'Développement du leadership',
                  'Accompagnement des transitions',
                  'Favoriser l\'engagement et la performance'
                ]
              },
              {
                icon: '🔄',
                title: 'Conduite du changement',
                desc: 'Nous aidons les organisations à réussir leurs transformations en alignant les dimensions humaines et opérationnelles. Grâce à un diagnostic précis, des stratégies sur mesure et la mobilisation des équipes, nous garantissons cohérence, adhésion et performance durable.',
                benefits: [
                  'Diagnostic précis des enjeux',
                  'Stratégies de transformation sur mesure',
                  'Mobilisation et engagement des équipes',
                  'Pérennité du changement'
                ]
              },
              {
                icon: '📚',
                title: 'Formation & Sensibilisation',
                desc: 'Nous développons des parcours de formation sur mesure pour renforcer les compétences clés et installer une culture d\'amélioration continue. Nos programmes interactifs sont orientés résultats et visent un impact concret sur la performance individuelle et collective.',
                benefits: [
                  'Parcours de formation personnalisés',
                  'Renforcement des compétences clés',
                  'Culture d\'amélioration continue',
                  'Impact mesurable sur la performance'
                ]
              }
            ].map((approche, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-5">{approche.icon}</div>
                <div className="w-10 h-1 bg-[#7AB648] mb-4 rounded-full"></div>
                <h3 className="text-2xl font-bold text-[#1B3F7A] mb-4">{approche.title}</h3>
                <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                  {approche.desc}
                </p>
                <div className="space-y-2 mb-6">
                  {approche.benefits.map((benefit, j) => (
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

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif font-bold text-[#1B3F7A] mt-3 mb-3">Questions fréquentes</h2>
            <div className="w-16 h-1 bg-[#7AB648] mx-auto rounded-full"></div>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
              Trouvez rapidement les réponses à vos questions les plus courantes.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs.length > 0 ? faqs.map((faq: any) => (
                <details key={faq.id} className="bg-white rounded-lg px-6 py-4 border border-gray-100 group shadow-sm hover:shadow-md transition-shadow">
                  <summary className="text-left text-lg font-semibold text-[#1B3F7A] hover:text-[#7AB648] cursor-pointer flex justify-between items-center py-2">
                    {faq.question}
                    <ChevronDown className="w-5 h-5 text-[#7AB648] group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                  </summary>
                  <div className="text-gray-700 mt-4 pb-2 whitespace-pre-wrap">
                    {faq.answer}
                  </div>
                </details>
              )) : (
                <div className="text-center text-gray-500 py-8">Aucune question fréquente pour le moment.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-[#1B3F7A] mb-6">Prêt à transformer votre organisation ?</h2>
          <div className="w-16 h-1 bg-[#7AB648] mx-auto rounded-full mb-8"></div>
          <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
            Parlons de vos défis et découvrez comment nos approches peuvent vous accompagner vers la performance et la durabilité.
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
