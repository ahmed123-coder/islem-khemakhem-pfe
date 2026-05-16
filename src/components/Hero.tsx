'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import type { HeroContent } from '@/lib/content'

export default function Hero() {
  const [content, setContent] = useState<HeroContent | null>(null)

  useEffect(() => {
    fetch('/api/content/hero', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setContent(data?.data?.value || data?.value))
      .catch(() => setContent(null))
  }, [])

  const heroImage = content?.image || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1600';

  return (
    <>
      <section className="relative bg-[#2B4F8A] text-white overflow-hidden min-h-[500px]">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover opacity-30"
            style={{ backgroundImage: `url(${heroImage})`, backgroundPosition: 'center 30%' }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-[#7AB648]/20 text-[#7AB648] border-[#7AB648]/30 hover:bg-[#7AB648]/30">
              Cabinet de Conseil & Accompagnement
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight tracking-tight text-white">
              {content?.title || "Transformez vos défis en opportunités de performance durable !"}
              <div className="w-22 h-1 bg-[#7AB648] rounded-full mt-4"></div>
            </h1>
            <p className="text-base mb-10 text-white/75 leading-relaxed border-l-4 border-[#7AB648] pl-4 italic">
              {content?.subtitle || "Accédez à un réseau d’experts métier engagés et inspirants afin de favoriser la pérennité de votre entreprise."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={content?.ctaLink || "/contact"}>
                <Button className="bg-[#7AB648] hover:bg-[#639a3a] text-white rounded-lg px-6 py-6 text-base font-semibold">
                  {content?.ctaText || "Nous contacter"}
                </Button>
              </Link>
              <Link href="/solutions">
                <Button className="bg-white text-[#7AB648] hover:bg-gray-100 rounded-lg px-6 py-6 text-base font-semibold border-2 border-white">
                  Découvrir nos approches
                </Button>
              </Link>
            </div>
          </div>
        </div>


      </section>

      {/* Vision & Mission Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#7AB648]/20 bg-[#7AB648]/5 p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-[#1B3F7A] mb-4 font-bold">Vision</p>
              <p className="text-gray-700 leading-relaxed text-lg">
                Se placer comme le catalyseur de votre performance, pour un avenir ambitieux et durable.              </p>
            </div>
            <div className="rounded-3xl border border-[#1B3F7A]/20 bg-[#1B3F7A]/5 p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-[#1B3F7A] mb-4 font-bold">Mission</p>
              <p className="text-gray-700 leading-relaxed text-lg">
                Accompagner les entreprises dans la construction d’organisations plus performantes, plus humaines et plus agiles, en transformant les défis managériaux en leviers de croissance et de performance.              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
