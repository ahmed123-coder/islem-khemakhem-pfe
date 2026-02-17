'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import type { NavbarContent } from '@/lib/content'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState<NavbarContent | null>(null)

  useEffect(() => {
    fetch('/api/content/navbar')
      .then(res => res.json())
      .then(data => setContent(data.value))
      .catch(() => setContent({ logo: 'DSL Conseil', links: [] }))
  }, [])

  if (!content) return null

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[#2B5A8E] flex items-center justify-center text-white font-bold text-xl">
              {content.logo.charAt(0)}
            </div>
            <span className="text-xl font-bold text-gray-900">{content.logo}</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {content.links.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className={i === 0 ? "text-[#2B5A8E] font-medium" : "text-[#64748B] hover:text-[#2B5A8E] transition-colors"}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-gray-700">
              Connexion
            </Link>
            <Button className="bg-[#2B5A8E] hover:bg-[#234a73] rounded-lg">
              Prendre RDV
            </Button>
          </div>
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
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
            {content.links.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className={i === 0 ? "block text-[#2B5A8E] font-medium py-2" : "block text-gray-700 py-2"}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}