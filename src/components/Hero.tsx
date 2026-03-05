'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import type { HeroContent } from '@/lib/content'

export default function Hero() {
  const [content, setContent] = useState<HeroContent | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetch('/api/content/hero')
      .then(res => res.json())
      .then(data => setContent(data.value))
      .catch(() => setContent(null))
    
    fetch('/api/hero')
      .then(res => res.json())
      .then(data => setImages(data.images || []))
  }, [])

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [images.length])

  if (!content) return null

  return (
    <section className="relative bg-[#2B5A8E] text-white overflow-hidden min-h-[600px]">
      {images.length > 0 ? (
        <div className="absolute inset-0">
          {images.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentIndex ? 'opacity-30' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1600')] bg-cover bg-center opacity-30"></div>
      )}
      
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

      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
