import type { Metadata } from 'next'
import { CheckCircle2, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'approaches' })
  return {
    title: t('title'),
    description: t('description'),
  }
}

async function getFaqs() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/faqs`, { cache: 'no-store' });
    if (!res.ok) return [];
    const result = await res.json();
    const data = result.data || result
    return Array.isArray(data) ? data.filter((faq: any) => faq.isActive) : [];
  } catch (error) {
    console.error("Fetch faqs error:", error);
    return [];
  }
}

async function getApproches() {
  try {
    const approches = await prisma.blog.findMany({
      where: { published: true },
      orderBy: { createdAt: 'asc' }
    });
    return approches;
  } catch (error) {
    console.error("Fetch approches error:", error);
    return [];
  }
}

export default async function ApprochesPage() {
  const t = useTranslations('approaches')
  const commonT = useTranslations('common')
  const faqs = await getFaqs();
  const approches = await getApproches();
  let heroData: any = null;
  try {
    const heroContent = await prisma.siteContent.findUnique({ where: { key: 'hero-approches' } })
    if (heroContent && heroContent.value) {
      heroData = heroContent.value
    }
  } catch(e) {
    console.error(e)
  }

  return (
    <>
      {/* Hero Section */}
      <section 
        className="relative bg-[#2B4F8A] text-white overflow-hidden min-h-[400px]"
        style={heroData?.image ? { backgroundImage: `url(${heroData.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {!heroData?.image && <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600')] bg-cover opacity-20" style={{backgroundPosition: 'center 30%'}}></div>}
        {heroData?.image && <div className="absolute inset-0 bg-[#2B4F8A]/80 mix-blend-multiply" />}
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight tracking-tight text-white">
              {heroData?.title || t('title')}
              <div className="w-22 h-1 bg-[#7AB648] rounded-full mt-4"></div>
            </h1>
            <p className="text-lg text-white/90 leading-relaxed border-l-4 border-[#7AB648] pl-4 whitespace-pre-line">
              {heroData?.subtitle || t('fallbackDescription')}
            </p>
          </div>
        </div>
      </section>

      {/* Approches Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {approches.length > 0 ? approches.map((approche, index) => {
            return (
              <div key={approche.id || index} className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center group ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    {approche.icon && (
                      <div className="w-20 h-20 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex items-center justify-center mb-8 overflow-hidden group-hover:-translate-y-1 transition-transform duration-500 relative">
                        <div className="absolute inset-0 bg-[#7AB648]/10 group-hover:bg-[#7AB648]/0 transition-colors duration-500"></div>
                        <img src={approche.icon} alt={approche.title} className="w-12 h-12 object-contain relative z-10 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    <h2 className="text-4xl font-serif font-extrabold text-gray-900 mb-6 leading-tight group-hover:text-[#1B3F7A] transition-colors duration-300">
                      {approche.title}
                    </h2>
                    {approche.excerpt && (
                      <p className="text-lg text-gray-600 mb-4 leading-relaxed font-medium">
                        {approche.excerpt}
                      </p>
                    )}
                    {approche.content && (
                      <div className="text-gray-600 leading-relaxed whitespace-pre-wrap mb-8 text-sm">
                        {approche.content}
                      </div>
                    )}

                  </div>
                  <div 
                    className={`relative h-[300px] sm:h-[400px] w-full rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgb(0,0,0,0.1)] group-hover:shadow-[0_20px_50px_rgb(27,63,122,0.15)] transition-shadow duration-500 ${index % 2 === 1 ? 'lg:order-1' : ''}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    {approche.image ? (
                      <img src={approche.image} alt={approche.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <div className="text-8xl opacity-10 drop-shadow-sm">📊</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          }) : (
            <div className="text-center py-10 text-gray-500">
              {t('noApproaches')}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif font-bold text-[#1B3F7A] mt-3 mb-3">{t('faq')}</h2>
            <div className="w-16 h-1 bg-[#7AB648] mx-auto rounded-full"></div>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
              {t('faqDescription')}
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
                <div className="text-center text-gray-500 py-8">{t('noFaqs')}</div>
              )}
            </div>
          </div>
        </div>
      </section>


    </>
  )
}
