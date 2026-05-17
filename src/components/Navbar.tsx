'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const pathname = usePathname()
  const t = useTranslations('navigation')

  const locale = pathname.split('/')[1] || 'en'

  useEffect(() => {
    fetch('/api/content/logo', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const val = data?.data?.value || data?.value;
        if (val && val.url) {
          setLogoUrl(val.url)
        }
      })
      .catch(() => setLogoUrl(null))
  }, [])

  const navLinks = [
    { label: t('home'), href: `/${locale}/` },
    { label: t('solutions'), href: `/${locale}/solutions` },
    { label: t('approaches'), href: `/${locale}/approches` },
    { label: t('contact'), href: `/${locale}/contact` },
  ]

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          <Link href={`/${locale}/`} className="flex items-center shrink-0">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="DSL Consulting"
                width={50}
                height={50}
                className="object-contain"
              />
            ) : (
              <Image
                src="/logo-1772242356501-removebg-preview.png"
                alt="DSL Consulting"
                width={100}
                height={50}
                className="object-contain"
              />
            )}
          </Link>

          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-10">
              {navLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className={pathname === link.href || pathname === link.href.slice(0, -1) ? 'text-[#1B3F7A] font-semibold' : 'text-[#64748B] hover:text-[#1B3F7A] transition-colors'}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 shrink-0">
            <LanguageSwitcher />
            <Link href={`/${locale}/login`} className="flex items-center gap-2 text-[#1B3F7A] hover:text-[#152f5c] transition-colors font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#7AB648]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              {t('login')}
            </Link>
          </div>

          <div className="md:hidden flex items-center shrink-0">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t">
          <div className="px-4 pt-4 pb-6 space-y-4 bg-white">
            {navLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className={pathname === link.href || pathname === link.href.slice(0, -1) ? 'block text-[#1B3F7A] font-semibold py-2' : 'block text-gray-700 py-2'}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t">
              <LanguageSwitcher />
            </div>
            <Link href={`/${locale}/login`} className="flex items-center gap-2 text-[#1B3F7A] font-medium py-2" onClick={() => setIsOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#7AB648]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              {t('login')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}