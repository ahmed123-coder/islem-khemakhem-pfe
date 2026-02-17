'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { FooterContent } from '@/lib/content'

export default function Footer() {
  const [content, setContent] = useState<FooterContent | null>(null)

  useEffect(() => {
    fetch('/api/content/footer')
      .then(res => res.json())
      .then(data => setContent(data.value))
      .catch(() => setContent(null))
  }, [])

  if (!content) return null

  return (
    <footer className="bg-[#1E293B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#F59E0B] flex items-center justify-center text-white font-bold text-xl">
                {content.company.charAt(0)}
              </div>
              <span className="text-xl font-bold">{content.company}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {content.tagline}
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><Link href="/services" className="text-gray-400 hover:text-white transition-colors text-sm">Management</Link></li>
              <li><Link href="/services" className="text-gray-400 hover:text-white transition-colors text-sm">Ressources Humaines</Link></li>
              <li><Link href="/services" className="text-gray-400 hover:text-white transition-colors text-sm">Qualité & RSE</Link></li>
              <li><Link href="/services" className="text-gray-400 hover:text-white transition-colors text-sm">Performance</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Plateforme</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">Espace Client</Link></li>
              <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">Espace Consultant</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors text-sm">Blog & Ressources</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-[#F59E0B]" />
                <span className="text-gray-400">{content.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-[#F59E0B]" />
                <span className="text-gray-400">{content.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-[#F59E0B]" />
                <span className="text-gray-400">{content.address}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} {content.company}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}