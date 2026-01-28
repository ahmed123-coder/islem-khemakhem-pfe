import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import ServiceCard from '@/components/ServiceCard'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Transform your business with ConsultPro\'s expert consulting services. We specialize in strategic management, HR solutions, quality assurance, and performance optimization for sustainable growth.',
}

const services = [
  {
    title: 'Strategic Management',
    description: 'Comprehensive business strategy development and implementation for sustainable growth and competitive advantage.',
    icon: '🎯'
  },
  {
    title: 'Human Resources',
    description: 'Complete HR solutions from talent acquisition to performance management and organizational development.',
    icon: '👥'
  },
  {
    title: 'Quality Assurance',
    description: 'Quality management systems and process optimization for operational excellence and compliance.',
    icon: '✅'
  },
  {
    title: 'Performance Analytics',
    description: 'Data-driven insights and KPI tracking for informed business decisions and continuous improvement.',
    icon: '📊'
  }
]

export default function Home() {
  return (
    <>
      <Hero />
      
      {/* Services Section */}
      <section className="py-24 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-20">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">Our Core Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We deliver comprehensive business solutions designed to optimize your operations and drive sustainable growth across all business functions.
            </p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden" aria-label="Company Statistics">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">Our Track Record</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center text-white">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">500+</div>
              <div className="text-xl opacity-90">Projects Completed</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">15+</div>
              <div className="text-xl opacity-90">Years Experience</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">98%</div>
              <div className="text-xl opacity-90">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Partner with ConsultPro to achieve operational excellence, strategic growth, and sustainable competitive advantage in your industry.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/contact" className="btn-primary text-lg" aria-label="Start your consulting project">
              Start Your Project
            </a>
            <a href="/services" className="btn-secondary text-lg" aria-label="Explore our consulting services">
              Explore Services
            </a>
          </div>
        </div>
      </section>
    </>
  )
}