import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Quote, BookOpen, ChevronDown } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ressources - DSL Conseil',
  description: 'Retrouvez toutes les ressources utiles pour mieux comprendre nos services, consulter les réponses aux questions fréquentes et découvrir les retours de nos clients.',
}

async function getBlogs() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/blogs`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Fetch blogs error:", error);
    return [];
  }
}

export default async function Ressources() {
  const articles = await getBlogs();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-[#2B4F8A] text-white overflow-hidden min-h-[400px]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600')] bg-cover bg-center opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-[#7AB648]/20 text-[#7AB648] border-[#7AB648]/30 hover:bg-[#7AB648]/30">
              Centre de Ressources
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight text-white">
              Toutes nos ressources
              <div className="w-22 h-1 bg-[#7AB648] rounded-full mt-4"></div>
            </h1>
            <p className="text-base mb-10 text-white/75 leading-relaxed border-l-4 border-[#7AB648] pl-4 italic">
              Retrouvez toutes les ressources utiles pour mieux comprendre nos services, consulter les réponses aux questions fréquentes et découvrir les retours de nos clients.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
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
              <details className="bg-gray-50 rounded-lg px-6 py-4 border border-gray-100 group">
                <summary className="text-left text-lg font-semibold text-[#1B3F7A] hover:text-[#7AB648] cursor-pointer flex justify-between items-center py-2">
                  Comment réserver une consultation ?
                  <ChevronDown className="w-5 h-5 text-[#7AB648] group-open:rotate-180 transition-transform" />
                </summary>
                <div className="text-gray-700 mt-4 pb-2">
                  Pour réserver une consultation, connectez-vous à votre espace client et accédez à la section "Réservations".
                  Choisissez le type de consultation souhaité, sélectionnez une date et heure disponible, puis confirmez votre réservation.
                  Vous recevrez une confirmation par email avec tous les détails de votre rendez-vous.
                </div>
              </details>

              <details className="bg-gray-50 rounded-lg px-6 py-4 border border-gray-100 group">
                <summary className="text-left text-lg font-semibold text-[#1B3F7A] hover:text-[#7AB648] cursor-pointer flex justify-between items-center py-2">
                  Quels sont les types d'abonnements disponibles ?
                  <ChevronDown className="w-5 h-5 text-[#7AB648] group-open:rotate-180 transition-transform" />
                </summary>
                <div className="text-gray-700 mt-4 pb-2">
                  Nous proposons trois types d'abonnements : Essentiel (consultations ponctuelles), Professionnel (suivi mensuel)
                  et Entreprise (accompagnement complet avec équipe dédiée). Chaque abonnement est adapté aux besoins spécifiques
                  de votre organisation et peut être personnalisé selon vos exigences.
                </div>
              </details>

              <details className="bg-gray-50 rounded-lg px-6 py-4 border border-gray-100 group">
                <summary className="text-left text-lg font-semibold text-[#1B3F7A] hover:text-[#7AB648] cursor-pointer flex justify-between items-center py-2">
                  Puis-je modifier ou annuler un rendez-vous ?
                  <ChevronDown className="w-5 h-5 text-[#7AB648] group-open:rotate-180 transition-transform" />
                </summary>
                <div className="text-gray-700 mt-4 pb-2">
                  Oui, vous pouvez modifier ou annuler votre rendez-vous jusqu'à 24 heures avant la date prévue via votre espace client.
                  Pour les annulations tardives ou les no-shows, des frais peuvent s'appliquer selon nos conditions générales.
                  Nous vous recommandons de contacter notre équipe si vous avez besoin d'une modification urgente.
                </div>
              </details>

              <details className="bg-gray-50 rounded-lg px-6 py-4 border border-gray-100 group">
                <summary className="text-left text-lg font-semibold text-[#1B3F7A] hover:text-[#7AB648] cursor-pointer flex justify-between items-center py-2">
                  Comment se déroule une consultation en ligne ?
                  <ChevronDown className="w-5 h-5 text-[#7AB648] group-open:rotate-180 transition-transform" />
                </summary>
                <div className="text-gray-700 mt-4 pb-2">
                  Les consultations en ligne se déroulent via notre plateforme sécurisée Zoom. Après confirmation de votre réservation,
                  vous recevrez un lien de connexion. Assurez-vous d'avoir une bonne connexion internet et un environnement calme.
                  La consultation commence par un échange sur vos besoins, suivi de recommandations personnalisées et d'un plan d'action.
                </div>
              </details>

              <details className="bg-gray-50 rounded-lg px-6 py-4 border border-gray-100 group">
                <summary className="text-left text-lg font-semibold text-[#1B3F7A] hover:text-[#7AB648] cursor-pointer flex justify-between items-center py-2">
                  Quels moyens de paiement sont acceptés ?
                  <ChevronDown className="w-5 h-5 text-[#7AB648] group-open:rotate-180 transition-transform" />
                </summary>
                <div className="text-gray-700 mt-4 pb-2">
                  Nous acceptons les cartes de crédit (Visa, MasterCard, American Express), les virements bancaires,
                  et les paiements par chèque pour les abonnements annuels. Tous les paiements sont sécurisés et traités
                  via notre partenaire bancaire certifié. Les factures sont disponibles dans votre espace client.
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif font-bold text-[#1B3F7A] mt-3 mb-3">Témoignages clients</h2>
            <div className="w-16 h-1 bg-[#7AB648] mx-auto rounded-full"></div>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
              Découvrez ce que nos clients disent de leur expérience avec DSL Conseil.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white border-gray-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#7AB648] fill-current" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-[#7AB648] mx-auto mb-4 opacity-50" />
                <p className="text-gray-700 mb-6 italic">
                  "La plateforme nous a permis d'améliorer notre organisation interne efficacement.
                  L'accompagnement personnalisé a transformé notre approche du management."
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-[#1B3F7A]">Marie L.</p>
                  <p className="text-sm text-gray-500">Responsable RH</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#7AB648] fill-current" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-[#7AB648] mx-auto mb-4 opacity-50" />
                <p className="text-gray-700 mb-6 italic">
                  "Les consultants DSL ont une expertise remarquable. Leur méthodologie
                  nous a aidés à optimiser nos processus qualité et à gagner en performance."
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-[#1B3F7A]">Ahmed K.</p>
                  <p className="text-sm text-gray-500">Directeur Qualité</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#7AB648] fill-current" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-[#7AB648] mx-auto mb-4 opacity-50" />
                <p className="text-gray-700 mb-6 italic">
                  "Un accompagnement professionnel qui fait la différence.
                  DSL Conseil nous a aidés à structurer notre stratégie RH de manière durable."
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-[#1B3F7A]">Sophie M.</p>
                  <p className="text-sm text-gray-500">DRH</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif font-bold text-[#1B3F7A] mt-3 mb-3">Articles & conseils</h2>
            <div className="w-16 h-1 bg-[#7AB648] mx-auto rounded-full"></div>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
              Découvrez nos derniers articles sur le management, les RH et l'optimisation des performances.
            </p>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.slice(0, 6).map((article: any) => (
                <Card key={article.id} className="h-full group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_50px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col border border-gray-100/50 bg-white">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-[#7AB648]/10 text-[#7AB648] border-[#7AB648]/20">
                        {article.category || 'Conseil'}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-[#1B3F7A] group-hover:text-[#7AB648] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                      {article.excerpt || article.content?.substring(0, 150) + '...'}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <Link href={`/blog/${article.id}`}>
                        <Button variant="ghost" size="sm" className="text-[#7AB648] hover:text-[#639a3a] hover:bg-[#7AB648]/10">
                          Lire plus →
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Articles à venir</h3>
              <p className="text-gray-500">Nous préparons du contenu exclusif pour vous accompagner dans vos projets.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/blog">
              <Button className="bg-[#7AB648] hover:bg-[#639a3a] text-white px-8 py-6 text-lg font-semibold">
                Voir tous les articles
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}