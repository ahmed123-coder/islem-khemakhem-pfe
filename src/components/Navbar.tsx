'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[#2B5A8E] flex items-center justify-center text-white font-bold text-xl">
              D
            </div>
            <span className="text-xl font-bold text-gray-900">DSL Conseil</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-[#2B5A8E] font-medium">
              Accueil
            </Link>
            <Link href="/services" className="text-[#64748B] hover:text-[#2B5A8E] transition-colors">
              Services
            </Link>
            <Link href="/blog" className="text-[#64748B] hover:text-[#2B5A8E] transition-colors">
              Blog
            </Link>
            <Link href="/contact" className="text-[#64748B] hover:text-[#2B5A8E] transition-colors">
              Contact
            </Link>
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
            <Link href="/" className="block text-[#2B5A8E] font-medium py-2">
              Accueil
            </Link>
            <Link href="/services" className="block text-gray-700 py-2">
              Services
            </Link>
            <Link href="/blog" className="block text-gray-700 py-2">
              Blog
            </Link>
            <Link href="/contact" className="block text-gray-700 py-2">
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}