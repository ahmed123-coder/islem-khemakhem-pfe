'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import type { HeroContent } from '@/lib/content'

export default function Hero() {
  const [content, setContent] = useState<HeroContent | null>(null)

  useEffect(() => {
    fetch('/api/content/hero')
      .then(res => res.json())
      .then(data => setContent(data.value))
      .catch(() => setContent(null))
  }, [])

  if (!content) return null

  return (
    <section className="relative bg-[#2B5A8E] text-white overflow-hidden min-h-[600px]">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1600')] bg-cover bg-center opacity-30"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-3xl">
          <Badge className="mb-6 bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30 hover:bg-[#F59E0B]/30">
            Cabinet de Conseil & Accompagnement
          </Badge>
          <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight">
            {content.title}
          </h1>
          <p className="text-xl mb-10 text-white/90 leading-relaxed">
            {content.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={content.ctaLink}>
              <Button className="bg-[#F59E0B] hover:bg-[#ea8c00] text-white rounded-lg px-6 py-6 text-base">
                {content.ctaText} →
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#2B5A8E] rounded-lg px-6 py-6 text-base">
                Découvrir nos services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}