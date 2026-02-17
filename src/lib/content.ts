import { prisma } from './prisma'

export interface NavbarContent {
  logo: string
  links: Array<{ label: string; href: string }>
}

export interface HeroContent {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
}

export interface FooterContent {
  company: string
  tagline: string
  email: string
  phone: string
  address: string
  social: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
}

export type SiteContentKey = 'navbar' | 'hero' | 'footer'

export async function getSiteContent<T>(key: SiteContentKey): Promise<T | null> {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { key }
    })
    return content ? (content.value as T) : null
  } catch {
    return null
  }
}

export async function updateSiteContent(key: SiteContentKey, value: any) {
  return await prisma.siteContent.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  })
}
