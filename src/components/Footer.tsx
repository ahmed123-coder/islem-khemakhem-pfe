'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Globe, Settings, Users, TrendingUp, Shield } from 'lucide-react'

import { useState, useEffect } from 'react'

export default function Footer() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/content/logo')
      .then(res => res.json())
      .then(data => {
        if (data && data.value && data.value.url) {
          setLogoUrl(data.value.url)
        }
      })
      .catch(() => setLogoUrl(null))
  }, [])
  return (
    <footer className="bg-white text-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b-2 border-[#7AB648] pb-10">

          {/* Col 1 - Logo + tagline */}
          <div className="flex flex-col gap-4">
            <Image
              src={logoUrl || "/logo-1772242356501-removebg-preview.png"}
              alt="DSL Consulting"
              width={120}
              height={60}
              className="object-contain"
            />
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Le partenaire stratégique pour une transformation humaine et performante.
            </p>
          </div>

          {/* Col 2 - approches */}
          <div className="border-l-2 border-[#7AB648] pl-8">
            <h4 className="text-xs font-bold mb-5 text-[#7AB648] uppercase tracking-widest">Approches</h4>
            <ul className="space-y-3">
              {[
                { icon: <Settings className="h-4 w-4 text-[#7AB648]" />, label: 'Coaching professionnel' },
                { icon: <Users className="h-4 w-4 text-[#7AB648]" />, label: 'Conduite du changement' },
                { icon: <TrendingUp className="h-4 w-4 text-[#7AB648]" />, label: 'Formation & Sensibilisation' }
              ].map((item) => (
                <li key={item.label}>
                  <Link href="/services" className="flex items-center gap-3 text-gray-500 hover:text-[#1B3F7A] transition-colors text-sm">
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 - solutions */}
          <div className="border-l-2 border-[#7AB648] pl-8">
            <h4 className="text-xs font-bold mb-5 text-[#7AB648] uppercase tracking-widest">Solutions</h4>
            <ul className="space-y-3">
              {[
                { icon: <TrendingUp className="h-4 w-4 text-[#7AB648]" />, label: 'Management de la performance cachée' },
                { icon: <Globe className="h-4 w-4 text-[#7AB648]" />, label: 'Gestion prévisionnelle des emplois et compétences' },
                { icon: <Shield className="h-4 w-4 text-[#7AB648]" />, label: 'Marque employeur' }
              ].map((item) => (
                <li key={item.label}>
                  <Link href="/services" className="flex items-center gap-3 text-gray-500 hover:text-[#1B3F7A] transition-colors text-sm">
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 - Contact */}
          <div className="border-l-2 border-[#7AB648] pl-8">
            <h4 className="text-xs font-bold mb-5 text-[#7AB648] uppercase tracking-widest">Contact</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500">
                <span className="text-[#7AB648]"><Mail className="h-4 w-4" /></span>
                dslconsulting.contact@gmail.com
              </div>
              <div className="flex flex-col gap-2 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="text-[#7AB648]"><Phone className="h-4 w-4" /></span>
                  +216 25 307 534
                </div>
                <p className="text-xs text-gray-400">Numéro également disponible sur WhatsApp.</p>
              </div>
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500">
                <span className="text-[#7AB648]"><MapPin className="h-4 w-4" /></span>
                Sfax, Tunisie
              </div>
            </div>
          </div>

        </div>

        <div className="pt-6 text-center border-t border-gray-200">
          <p className="text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} DSL Consulting. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
