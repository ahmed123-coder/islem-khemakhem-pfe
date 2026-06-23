'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { Mail, Phone, MapPin, Globe, Settings, Users, TrendingUp, Shield, Lightbulb } from 'lucide-react'
import { useState, useEffect } from 'react'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Footer() {
  const t = useTranslations('home')
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'fr'
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [services, setServices] = useState<any[]>([])
  const [approaches, setApproaches] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/content/logo').then(res => res.json()).then(data => data?.value?.url || null).catch(() => null),
      fetch('/api/services').then(res => res.ok ? res.json() : []),
      fetch('/api/blogs').then(res => res.ok ? res.json() : [])
    ]).then(([logo, servicesData, approachesData]) => {
      setLogoUrl(logo as string | null)
      setServices(Array.isArray(servicesData) ? servicesData : [])
      setApproaches(Array.isArray(approachesData) ? approachesData : [])
    }).catch(() => {})
  }, [])

  return (
    <footer className="bg-white text-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b-2 border-[#7AB648] pb-10">

          <div className="flex flex-col gap-4">
            <Link href={`/${locale}/`}>
              <Image
                src={logoUrl || "/logo.png"}
                alt="DSL Consulting"
                width={120}
                height={60}
                className="object-contain hover:opacity-80 transition-opacity"
              />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              {t('cta.subtitle')}
            </p>
          </div>

          <div className="border-l-2 border-[#7AB648] pl-8">
            <h4 className="text- font-bold mb-5 text-[#7AB648] uppercase tracking-widest">{t('approaches.title')}</h4>
            <ul className="space-y-3">
              {approaches.slice(0, 6).map((approach: any) => (
                <li key={approach.id}>
                  <Link href={`/${locale}/blog/${approach.id}`} className="flex items-center gap-3 text-gray-500 hover:text-[#1B3F7A] transition-colors text-sm">
                    {approach.icon ? (
                      <img src={approach.icon} alt="" className="w-4 h-4 object-contain" />
                    ) : (
                      <Lightbulb className="h-4 w-4 text-[#7AB648]" />
                    )}
                    {approach.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-l-2 border-[#7AB648] pl-8">
            <h4 className="text- font-bold mb-5 text-[#7AB648] uppercase tracking-widest">{t('solutions.title')}</h4>
            <ul className="space-y-3">
              {services.slice(0, 6).map((service: any) => (
                <li key={service.id}>
                  <Link href={`/${locale}/solutions/${service.id}`} className="flex items-center gap-3 text-gray-500 hover:text-[#1B3F7A] transition-colors text-sm">
                    {(service.icon || service.logo) ? (
                      <img src={service.icon || service.logo} alt="" className="w-4 h-4 object-contain" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-[#7AB648]" />
                    )}
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-l-2 border-[#7AB648] pl-8">
            <h4 className="text- font-bold mb-5 text-[#7AB648] uppercase tracking-widest">{t('cta.contactUs')}</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2 text-m text-gray-500 break-all">
                <span className="text-[#7AB648] flex-shrink-0"><Mail className="h-4 w-4" /></span>
                <span className="break-all">dslconsulting.contact@gmail.com</span>
              </div>
              <div className="flex flex-col gap-2 border border-gray-200 rounded-lg px-4 py-3 text-m text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="text-[#7AB648]"><Phone className="h-4 w-4" /></span>
                  +216 25 307 534
                </div>
                <p className="text-xs text-gray-400">Numéro également disponible sur WhatsApp.</p>
              </div>
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2 text-m text-gray-500">
                <span className="text-[#7AB648]"><MapPin className="h-4 w-4" /></span>
                Sfax, Tunisie
              </div>
            </div>
          </div>

        </div>

        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-200">
          <p className="text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} DSL Consulting. Tous droits réservés.
          </p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  )
}