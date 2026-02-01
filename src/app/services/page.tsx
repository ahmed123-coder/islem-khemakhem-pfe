import type { Metadata } from 'next'
import ServiceCard from '@/components/ServiceCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Business Consulting Services',
  description: 'Comprehensive business consulting services including strategic management, operational excellence, HR solutions, quality management, performance analytics, and change management.',
}

const services = [
  {
    title: 'Strategic Management',
    description: 'Develop comprehensive business strategies, market analysis, and growth roadmaps for sustainable competitive advantage.',
    icon: '🎯'
  },
  {
    title: 'Operational Excellence',
    description: 'Optimize business processes, workflow automation, and operational efficiency to reduce costs and improve productivity.',
    icon: '⚙️'
  },
  {
    title: 'Human Resources',
    description: 'Complete HR solutions including talent acquisition, performance management, training programs, and organizational development.',
    icon: '👥'
  },
  {
    title: 'Quality Management',
    description: 'Implement ISO standards, quality control systems, and continuous improvement processes for operational excellence.',
    icon: '✅'
  },
  {
    title: 'Performance Analytics',
    description: 'Advanced data analytics, KPI development, and business intelligence solutions for data-driven decision making.',
    icon: '📊'
  },
  {
    title: 'Change Management',
    description: 'Guide organizations through digital transformation, restructuring, and cultural change initiatives.',
    icon: '🔄'
  }
]

export default function Services() {
  return (
    <article className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-20">
          <h1 className="text-5xl font-bold text-foreground mb-8">Professional Business Consulting Services</h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            We provide comprehensive consulting and business support services designed to optimize your operations, enhance performance, and drive sustainable growth across all aspects of your organization.
          </p>
        </header>
        
        {/* Services Grid */}
        <section aria-label="Our consulting services">
          <h2 className="sr-only">Service Offerings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="mt-20 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Need a Custom Solution?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Every business is unique. Let us create a tailored consulting approach that addresses your specific challenges and objectives.
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <a href="/contact" aria-label="Contact us to discuss your needs">Discuss Your Needs</a>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </article>
  )
}