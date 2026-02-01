import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with ConsultPro\'s expert business consultants. Contact us for strategic management, HR solutions, quality assurance, and performance optimization consulting services.',
}

export default function Contact() {
  return (
    <article className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-20">
          <h1 className="text-5xl font-bold text-foreground mb-8">Contact Our Consulting Experts</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ready to transform your business? Our expert consultants are here to help you achieve operational excellence, strategic growth, and sustainable competitive advantage.
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-8">Let's Start a Conversation</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Whether you're looking to optimize operations, develop strategic initiatives, enhance organizational performance, or implement quality management systems, we're here to help.
            </p>
            
            <address className="space-y-6 not-italic">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg" aria-hidden="true">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                  <a href="mailto:contact@consultpro.com" className="text-muted-foreground hover:text-blue-600 transition-colors">contact@consultpro.com</a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg" aria-hidden="true">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Call Us</h3>
                  <a href="tel:+15551234567" className="text-muted-foreground hover:text-blue-600 transition-colors">+1 (555) 123-4567</a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg" aria-hidden="true">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Visit Us</h3>
                  <p className="text-muted-foreground">123 Business Avenue<br />Suite 100, City, State 12345</p>
                </div>
              </div>
            </address>
          </section>
          
          {/* Contact Form */}
          <section>
            <Card>
              <CardContent className="p-10">
                <h2 className="text-2xl font-bold text-foreground mb-8">Send Us a Message</h2>
                <form className="space-y-6" aria-label="Contact form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-semibold text-foreground">
                        First Name *
                      </label>
                      <Input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-semibold text-foreground">
                        Last Name *
                      </label>
                      <Input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-foreground">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="company" className="text-sm font-semibold text-foreground">
                      Company
                    </label>
                    <Input
                      type="text"
                      id="company"
                      name="company"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="service" className="text-sm font-semibold text-foreground">
                      Service Interest
                    </label>
                    <select
                      id="service"
                      name="service"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select a service</option>
                      <option value="strategic">Strategic Management</option>
                      <option value="operations">Operational Excellence</option>
                      <option value="hr">Human Resources</option>
                      <option value="quality">Quality Management</option>
                      <option value="performance">Performance Analytics</option>
                      <option value="change">Change Management</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-semibold text-foreground">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      placeholder="Tell us about your project or consulting needs..."
                    />
                  </div>
                  
                  <Button
                    type="button"
                    size="lg"
                    className="w-full text-lg py-6 h-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    aria-label="Send your message to ConsultPro"
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </article>
  )
}