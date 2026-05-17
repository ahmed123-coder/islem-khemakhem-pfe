import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await prisma.blog.findUnique({ where: { id } })
  if (!article) return { title: 'Not Found' }
  return {
    title: `${article.title} | Business Consulting`,
    description: article.excerpt,
  }
}

export default async function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await prisma.blog.findUnique({ where: { id } })

  if (!article || !article.published) {
    notFound()
  }

  return (
    <article className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="w-full bg-slate-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <Link href="/blog" className="inline-flex items-center text-[#2B5A8E] hover:text-[#1d3d61] font-medium mb-8 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Retour au blog
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <Badge variant="secondary" className="bg-blue-100/80 text-blue-800 hover:bg-blue-200 border-none px-3 py-1">
              Expert Consultant
            </Badge>
            <time className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {new Date(article.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-8">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-3xl">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 border-t border-gray-200 pt-8 mt-8">
            {article.icon ? (
              <img src={article.icon} alt="Author Icon" className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-lg">
                D
              </div>
            )}
            <div>
              <p className="font-bold text-gray-900">DSL Conseil</p>
              <p className="text-sm text-gray-500">Équipe Consulting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Image */}
      {article.image && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
          <div className="rounded-2xl overflow-hidden shadow-2xl bg-white p-2">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full max-h-[600px] object-cover rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="prose prose-lg prose-blue max-w-none 
          prose-headings:font-bold prose-headings:text-gray-900 
          prose-p:text-gray-700 prose-p:leading-relaxed 
          prose-a:text-[#2B5A8E] prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900">
          {article.content.split('\n').map((paragraph, index) => (
             paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
          ))}
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-200 flex items-center justify-between">
          <p className="text-gray-900 font-bold">Avez-vous trouvé cet article utile ?</p>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-full shadow-sm hover:bg-gray-50">Oui</Button>
            <Button variant="outline" className="rounded-full shadow-sm hover:bg-gray-50">Non</Button>
          </div>
        </div>
      </div>
    </article>
  )
}
