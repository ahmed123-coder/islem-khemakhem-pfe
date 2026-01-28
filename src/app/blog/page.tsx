import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Business Consulting Blog',
  description: 'Expert insights on business consulting, strategic management, HR solutions, quality management, and performance optimization. Stay updated with industry trends and best practices.',
}

const articles = [
  {
    id: 1,
    title: 'The Future of Business Consulting in 2024',
    excerpt: 'Exploring emerging trends, digital transformation, and innovative methodologies shaping the modern consulting landscape and client expectations.',
    date: '2024-01-15',
    readTime: '5 min read',
    category: 'Strategy'
  },
  {
    id: 2,
    title: 'Effective Performance Management Strategies',
    excerpt: 'Key approaches to measuring, tracking, and improving organizational performance through data-driven insights, KPI optimization, and continuous improvement frameworks.',
    date: '2024-01-10',
    readTime: '7 min read',
    category: 'Performance'
  },
  {
    id: 3,
    title: 'Digital Transformation in Human Resources',
    excerpt: 'How technology and automation are revolutionizing HR processes, from recruitment and onboarding to employee engagement, performance tracking, and retention strategies.',
    date: '2024-01-05',
    readTime: '6 min read',
    category: 'HR'
  },
  {
    id: 4,
    title: 'Quality Management Best Practices',
    excerpt: 'Essential practices for implementing effective quality management systems, achieving ISO compliance, and establishing continuous improvement processes in modern organizations.',
    date: '2023-12-28',
    readTime: '8 min read',
    category: 'Quality'
  },
  {
    id: 5,
    title: 'Leadership in Times of Change',
    excerpt: 'Strategic leadership approaches for navigating organizational change, building resilient business cultures, and maintaining team performance during transformation initiatives.',
    date: '2023-12-20',
    readTime: '6 min read',
    category: 'Leadership'
  },
  {
    id: 6,
    title: 'Data-Driven Decision Making',
    excerpt: 'Leveraging business analytics, intelligence tools, and performance metrics to make informed strategic decisions and drive competitive advantage in dynamic markets.',
    date: '2023-12-15',
    readTime: '9 min read',
    category: 'Analytics'
  }
]

export default function Blog() {
  return (
    <article className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-8">Business Consulting Insights</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Stay informed with the latest trends, strategies, and best practices in business consulting, management, and organizational excellence from our expert consultants.
          </p>
        </header>
        
        {/* Articles Grid */}
        <section aria-label="Blog articles">
          <h2 className="sr-only">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article key={article.id} className="card p-8 h-full group hover:-translate-y-1">
                <header className="flex items-center justify-between mb-4">
                  <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                  <span className="text-sm text-gray-500">{article.readTime}</span>
                </header>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed flex-1">{article.excerpt}</p>
                <footer className="flex items-center justify-between">
                  <time className="text-sm text-gray-500" dateTime={article.date}>{article.date}</time>
                  <button className="text-blue-600 hover:text-blue-800 font-semibold flex items-center group" aria-label={`Read more about ${article.title}`}>
                    Read More
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </section>
        
        {/* Newsletter CTA */}
        <section className="mt-20 text-center bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Stay Updated with Expert Insights
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest insights, industry trends, and expert advice on business consulting and organizational excellence.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto" aria-label="Newsletter subscription">
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button type="button" className="btn-primary whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </section>
      </div>
    </article>
  )
}