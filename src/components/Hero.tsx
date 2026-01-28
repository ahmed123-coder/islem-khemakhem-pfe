import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-6xl lg:text-8xl font-bold mb-10 leading-tight">
            Excellence in
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">Business Consulting</span>
          </h1>
          <p className="text-2xl mb-16 text-gray-300 leading-relaxed max-w-4xl mx-auto">
            Transform your organization with strategic insights, operational excellence, and data-driven solutions from industry-leading consultants.
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Link href="/contact" className="btn-primary text-xl px-12 py-5">
              Get Started Today
            </Link>
            <Link href="/services" className="btn-secondary text-xl px-12 py-5 border-white text-white hover:bg-white hover:text-slate-900">
              Our Services
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
    </section>
  )
}