'use client'

import { useState } from 'react'
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
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            Contact
          </div>
          <h1 className="text-5xl font-bold mb-4">Parlons de votre projet</h1>
          <p className="text-xl text-blue-100">Notre équipe vous répond sous 24 heures.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Info - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Nos coordonnées</h2>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Email</h3>
                    <a href="mailto:contact@dsl-conseil.com" className="text-gray-900 font-medium hover:text-blue-700">
                      contact@dsl-conseil.com
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Téléphone</h3>
                    <a href="tel:+33123456789" className="text-gray-900 font-medium hover:text-blue-700">
                      +33 1 23 45 67 89
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Adresse</h3>
                    <p className="text-gray-900 font-medium">12 rue de la Performance, 75008 Paris</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Horaires</h3>
                    <p className="text-gray-900 font-medium">Lun-Ven : 9h00 - 18h00</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form - Right Side */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Envoyez-nous un message</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {submitStatus === 'success' && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-800">Merci ! Votre message a été envoyé avec succès.</p>
                      </div>
                    )}
                    {submitStatus === 'error' && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800">Erreur lors de l'envoi. Veuillez réessayer.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">Nom complet</label>
                        <Input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Jean Dupont"
                          required
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="jean@entreprise.com"
                          required
                          className="bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="company" className="text-sm font-medium text-gray-700">Entreprise</label>
                        <Input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Votre entreprise"
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-gray-700">Téléphone</label>
                        <Input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+33 6 12 34 56 78"
                          className="bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-gray-700">Sujet</label>
                      <Input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Objet de votre demande"
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Décrivez votre projet ou votre besoin..."
                        className="bg-gray-50"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-6 text-lg font-medium rounded-lg flex items-center gap-2"
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