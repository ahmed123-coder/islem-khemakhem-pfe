// Example: Using CMS Content in Components

// ============================================
// SERVER COMPONENT EXAMPLE
// ============================================
import { getSiteContent, NavbarContent, HeroContent } from '@/lib/content'

export default async function HomePage() {
  // Fetch content from database
  const hero = await getSiteContent<HeroContent>('hero')
  
  if (!hero) {
    return <div>Loading...</div>
  }

  return (
    <section className="hero">
      <h1>{hero.title}</h1>
      <p>{hero.subtitle}</p>
      <a href={hero.ctaLink}>{hero.ctaText}</a>
    </section>
  )
}

// ============================================
// CLIENT COMPONENT EXAMPLE
// ============================================
'use client'

import { useState, useEffect } from 'react'

export function DynamicNavbar() {
  const [navbar, setNavbar] = useState<any>(null)

  useEffect(() => {
    fetch('/api/content/navbar')
      .then(res => res.json())
      .then(data => setNavbar(data.value))
      .catch(err => console.error('Failed to load navbar:', err))
  }, [])

  if (!navbar) return null

  return (
    <nav>
      <div className="logo">{navbar.logo}</div>
      <ul>
        {navbar.links.map((link: any, i: number) => (
          <li key={i}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// ============================================
// ADMIN UPDATE EXAMPLE
// ============================================
async function updateHeroContent() {
  const response = await fetch('/api/content/hero', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      value: {
        title: 'New Hero Title',
        subtitle: 'Updated subtitle text',
        ctaText: 'Learn More',
        ctaLink: '/about'
      }
    })
  })

  if (response.ok) {
    const data = await response.json()
    console.log('Updated:', data)
  }
}

// ============================================
// DIRECT PRISMA USAGE (Server-side only)
// ============================================
import { prisma } from '@/lib/prisma'

async function getFooterContent() {
  const content = await prisma.siteContent.findUnique({
    where: { key: 'footer' }
  })
  return content?.value
}

async function updateFooterContent(newValue: any) {
  const content = await prisma.siteContent.upsert({
    where: { key: 'footer' },
    update: { value: newValue },
    create: { key: 'footer', value: newValue }
  })
  return content
}
