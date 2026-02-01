import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import ServiceCard from '@/components/ServiceCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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
            <Badge variant="outline" className="mb-6 text-blue-600 border-blue-200">
              Our Expertise
            </Badge>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">Core Services</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We deliver comprehensive business solutions designed to optimize your operations and drive sustainable growth.
            </p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
              Our Impact
            </Badge>
            <h2 className="text-3xl font-bold text-white mb-4">Proven Results</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">500+</div>
                <div className="text-white/90">Projects Completed</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">15+</div>
                <div className="text-white/90">Years Experience</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">98%</div>
                <div className="text-white/90">Client Satisfaction</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-6 text-blue-600 border-blue-200">
            Ready to Start?
          </Badge>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            Transform Your Business
          </h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Partner with ConsultPro to achieve operational excellence and sustainable competitive advantage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl">
              <a href="/contact">Start Your Project</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-foreground border-border hover:bg-accent hover:text-accent-foreground">
              <a href="/services">Explore Services</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}