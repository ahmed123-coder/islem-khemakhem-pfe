import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Business Consulting Blog',
  description: 'Expert insights on business consulting, strategic management, HR solutions, quality management, and performance optimization. Stay updated with industry trends and best practices.',
}

async function getBlogs() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/blogs`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Blog() {
  const articles = await getBlogs();

  if (!articles.length) {
    return <div className="py-20 text-center">No blogs available</div>;
  }
  return (
    <article className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-20">
          <Badge variant="outline" className="mb-6 text-blue-600 border-blue-200">
            Expert Insights
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-6">Business Consulting Insights</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Stay informed with the latest trends, strategies, and best practices in business consulting and organizational excellence.
          </p>
        </header>
        
        {/* Articles Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => (
              <Card key={article.id} className="h-full group hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {article.author}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col h-full pt-0">
                  <h3 className="text-lg font-bold text-foreground mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed flex-1 text-sm">{article.excerpt}</p>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <time className="text-xs text-muted-foreground" dateTime={new Date(article.createdAt).toISOString()}>
                      {new Date(article.createdAt).toLocaleDateString()}
                    </time>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 p-0 h-auto text-sm">
                      Read More →
                    </Button>
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
                Stay Updated
              </Badge>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Expert Insights Delivered
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Subscribe for the latest insights, industry trends, and expert advice on business consulting.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-white"
                  required
                />
                <Button type="button" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  Subscribe
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </article>
  )
}