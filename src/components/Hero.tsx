import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center max-w-5xl mx-auto">
          <div className="flex justify-center mb-8">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-400/30 text-sm px-4 py-2">
              ✨ Trusted by 500+ Companies
            </Badge>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-10 leading-tight">
            Excellence in
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">Business Consulting</span>
          </h1>
          <p className="text-xl mb-16 text-slate-300 leading-relaxed max-w-4xl mx-auto">
            Transform your organization with strategic insights, operational excellence, and data-driven solutions from industry-leading consultants.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="text-lg px-10 py-6 h-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-2xl hover:shadow-blue-500/25">
              <Link href="/contact">Get Started Today</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-lg px-10 py-6 h-auto border-2 border-white text-white hover:bg-white hover:text-slate-900 backdrop-blur-sm">
              <Link href="/services">Our Services</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
    </section>
  )
}