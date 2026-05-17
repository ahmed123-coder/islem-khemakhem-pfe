'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [heroData, setHeroData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/content/hero-contact', { cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .then(heroJSON => {
        const heroVal = heroJSON?.data?.value || heroJSON?.value;
        if (heroVal) {
          setHeroData(heroVal)
        }
      })
      .catch(err => console.error(err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', company: '', phone: '', subject: '', message: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative bg-[#2B4F8A] text-white overflow-hidden min-h-[300px]"
        style={heroData?.image 
          ? { backgroundImage: `url(${heroData.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
          : { backgroundImage: `url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1600')`, backgroundSize: 'cover', backgroundPosition: 'center' }
        }
      >
        <div className="absolute inset-0 bg-[#2B4F8A]/80 mix-blend-multiply" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
          <div className="max-w-4xl">
            <div className="inline-block bg-[#7AB648] text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              Contact
            </div>
            <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight text-white">
              {heroData?.title || 'Parlons de votre projet'}
              <div className="w-22 h-1 bg-[#7AB648] rounded-full mt-4"></div>
            </h1>
            <p className="text-base text-white/90 leading-relaxed border-l-4 border-[#7AB648] pl-4 italic whitespace-pre-line">
              {heroData?.subtitle || 'Notre équipe vous répond sous 24 heures. Contactez-nous pour transformer vos défis en opportunités de croissance.'}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Info - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-4xl font-serif font-bold text-[#1B3F7A] mb-3">Nos coordonnées</h2>
              <div className="w-16 h-1 bg-[#7AB648] rounded-full mb-8"></div>
              
              <Card className="hover:shadow-lg transition-shadow border-gray-100">
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="bg-[#7AB648]/10 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-[#7AB648]" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Email</h3>
                    <a href="mailto:contact@dsl-conseil.com" className="text-[#1B3F7A] font-medium hover:text-[#7AB648]">
                      contact@dsl-conseil.com
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-gray-100">
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="bg-[#7AB648]/10 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-[#7AB648]" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Téléphone</h3>
                    <a href="tel:25307534" className="text-[#1B3F7A] font-medium hover:text-[#7AB648]">
                      25 307 534
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-gray-100">
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="bg-[#7AB648]/10 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-[#7AB648]" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Adresse</h3>
                    <p className="text-[#1B3F7A] font-medium">
                      Route l'Ain km 0.5<br />
                      Immeuble Henda
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-gray-100">
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="bg-[#7AB648]/10 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-[#7AB648]" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Horaires</h3>
                    <p className="text-[#1B3F7A] font-medium">Lun-Ven : 9h00 - 18h00</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form - Right Side */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg border-gray-100">
                <CardContent className="p-8">
                  <h2 className="text-4xl font-serif font-bold text-[#1B3F7A] mb-3">Envoyez-nous un message</h2>
                  <div className="w-16 h-1 bg-[#7AB648] rounded-full mb-8"></div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {submitStatus === 'success' && (
                      <div className="p-4 bg-[#7AB648]/10 border border-[#7AB648]/20 rounded-md">
                        <p className="text-[#1B3F7A]">Merci ! Votre message a été envoyé avec succès.</p>
                      </div>
                    )}
                    {submitStatus === 'error' && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800">Erreur lors de l'envoi. Veuillez réessayer.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-[#1B3F7A]">Nom complet</label>
                        <Input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Jean Dupont"
                          required
                          className="bg-gray-50 border-gray-200 focus:border-[#7AB648]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-[#1B3F7A]">Email</label>
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="jean@entreprise.com"
                          required
                          className="bg-gray-50 border-gray-200 focus:border-[#7AB648]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="company" className="text-sm font-medium text-[#1B3F7A]">Entreprise</label>
                        <Input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Votre entreprise"
                          className="bg-gray-50 border-gray-200 focus:border-[#7AB648]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-[#1B3F7A]">Téléphone</label>
                        <Input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="25 307 534"
                          className="bg-gray-50 border-gray-200 focus:border-[#7AB648]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-[#1B3F7A]">Sujet</label>
                      <Input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Objet de votre demande"
                        className="bg-gray-50 border-gray-200 focus:border-[#7AB648]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-[#1B3F7A]">Message</label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Décrivez votre projet ou votre besoin..."
                        className="bg-gray-50 border-gray-200 focus:border-[#7AB648]"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#7AB648] hover:bg-[#639a3a] text-white px-8 py-6 text-lg font-medium rounded-lg flex items-center gap-2"
                    >
                      {isSubmitting ? 'Envoi...' : 'Envoyer'}
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}