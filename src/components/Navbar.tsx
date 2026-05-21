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

          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center gap-8 xl:gap-10">
              {navLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className={`whitespace-nowrap text-sm font-medium transition-colors ${
                    pathname === link.href || pathname === link.href.slice(0, -1)
                      ? 'text-[#1B3F7A] font-semibold'
                      : 'text-[#64748B] hover:text-[#1B3F7A]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <LanguageSwitcher />
            <Link href={`/${locale}/login`} className="flex items-center gap-2 text-[#1B3F7A] hover:text-[#152f5c] transition-colors font-medium text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#7AB648]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              {t('login')}
            </Link>
          </div>

          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
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
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        </div>
      )}

      <div className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between px-4 h-16 border-b">
          <span className="font-semibold text-[#1B3F7A]">Menu</span>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close menu">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        <div className="px-4 pt-4 pb-6 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href || pathname === link.href.slice(0, -1)
                  ? 'bg-[#1B3F7A]/10 text-[#1B3F7A] font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t">
            <Link
              href={`/${locale}/login`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#1B3F7A] hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#7AB648]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              {t('login')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}