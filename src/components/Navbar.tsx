'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Approches', href: '/approches' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const pathname = usePathname()

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
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center shrink-0">
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

          {/* Center: Nav Links */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-10">
              {NAV_LINKS.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className={pathname === link.href ? 'text-[#1B3F7A] font-semibold' : 'text-[#64748B] hover:text-[#1B3F7A] transition-colors'}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Connexion */}
          <div className="hidden md:flex items-center shrink-0">
              <Link href="/login" className="flex items-center gap-2 text-[#1B3F7A] hover:text-[#152f5c] transition-colors font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#7AB648]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Connexion
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
            {NAV_LINKS.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className={pathname === link.href ? 'block text-[#1B3F7A] font-semibold py-2' : 'block text-gray-700 py-2'}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="flex items-center gap-2 text-[#1B3F7A] font-medium py-2" onClick={() => setIsOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#7AB648]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Connexion
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

