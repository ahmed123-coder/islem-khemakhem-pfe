import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'blog' })
  return {
    title: t('title'),
    description: t('description'),
  }
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

export default async function Blog({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = useTranslations('blog')
  const articles = await getBlogs();

  if (!articles.length) {
    return <div className="py-20 text-center">{t('noBlogs')}</div>;
  }
  return (
    <article className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-20">
          <Badge variant="outline" className="mb-6 text-blue-600 border-blue-200">
            {t('expertInsights')}
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-6">{t('insights')}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Stay informed with the latest trends, strategies, and best practices in business consulting and organizational excellence.
          </p>
        </header>
        
        {/* Articles Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => (
              <Card key={article.id} className="h-full group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_50px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col border border-gray-100/50 bg-white">
                {article.image && (
                  <div className="h-56 w-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 opacity-70 group-hover:opacity-40 transition-opacity duration-500"></div>
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                    <div className="absolute top-4 right-4 z-20">
                      <Badge variant="secondary" className="bg-white/90 text-blue-900 hover:bg-white backdrop-blur-md shadow-sm border-none font-medium">
                        {article.author || t('expertConsultant')}
                      </Badge>
                    </div>
                  </div>
                )}
                <CardHeader className="pt-6 pb-2">
                  {!article.image && (
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none font-medium transition-colors">
                        {article.author || t('expertConsultant')}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    {article.icon && (
                      <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-white to-blue-50/50 flex flex-col items-center justify-center shadow-sm border border-gray-100 shrink-0 group-hover:shadow-[0_4px_12px_rgb(43,90,142,0.15)] group-hover:-translate-y-1 transition-all duration-300 p-2 relative overflow-hidden">
                        <img src={article.icon} alt="Icon" className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-[#2B5A8E] transition-colors duration-300 mt-1">
                      {article.title}
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col h-full pt-4">
                  <p className="text-gray-600 mb-6 leading-relaxed flex-1 text-sm line-clamp-3">{article.excerpt}</p>
                  <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <time dateTime={new Date(article.createdAt).toISOString()}>
                        {new Date(article.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </time>
                    </div>
                    <Link href={`/${locale}/blog/${article.id}`}>
                      <Button variant="ghost" size="sm" className="text-[#2B5A8E] hover:text-[#1d3d61] hover:bg-blue-50/50 p-2 h-auto text-sm font-bold group/btn rounded-lg">
                        {t('readMore')} <span className="inline-block transition-transform group-hover/btn:translate-x-1.5 ml-1">→</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Newsletter CTA */}
        <section className="mt-20">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-10 text-center">
              <Badge variant="outline" className="mb-4 text-blue-600 border-blue-300">
                {t('stayUpdated')}
              </Badge>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {t('insightsDelivered')}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Subscribe for the latest insights, industry trends, and expert advice on business consulting.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  className="flex-1 bg-white"
                  required
                />
                <Button type="button" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  {t('subscribe')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </article>
  )
}