import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from '@/lib/i18n'
import { locales, defaultLocale } from '@/i18n/request'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'
import NotificationProvider from '@/components/notifications/notification-provider'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale as typeof locales[number]
  if (!locales.includes(locale)) notFound()

  const logoContent = await prisma.siteContent.findUnique({
    where: { key: 'logo' },
  })
  let logoUrl = '/logo-1772242356501-removebg-preview.png'
  if (logoContent && logoContent.value && (logoContent.value as any).url) {
    logoUrl = (logoContent.value as any).url
  }

  const titles = {
    en: 'DSL Consulting - Business Consulting & Management Solutions',
    fr: 'DSL Conseil - Conseil en Entreprise et Solutions de Gestion',
  }
  const descriptions = {
    en: 'Leading business consulting firm specializing in strategic management, HR solutions, quality assurance, and performance optimization.',
    fr: 'Cabinet de conseil leader en management stratégique, solutions RH, assurance qualité et optimisation de la performance.',
  }

  return {
    title: {
      default: titles[locale] || titles.en,
      template: '%s | DSL Conseil'
    },
    description: descriptions[locale] || descriptions.en,
    keywords: ['business consulting', 'management consulting', 'HR solutions', 'quality management', 'performance optimization', 'strategic planning'],
    authors: [{ name: 'DSL Conseil' }],
    creator: 'DSL Conseil',
    publisher: 'DSL Conseil',
    alternates: {
      canonical: `https://dsl-conseil.com/${locale}`,
      languages: {
        'en': 'https://dsl-conseil.com/en',
        'fr': 'https://dsl-conseil.com/fr',
      },
    },
    icons: {
      icon: [
        { url: logoUrl },
        { url: logoUrl, rel: 'apple-touch-icon' },
      ],
      shortcut: logoUrl,
      apple: logoUrl,
    },
    openGraph: {
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocale: locale === 'fr' ? 'en_US' : 'fr_FR',
      url: `https://dsl-conseil.com/${locale}`,
      siteName: 'DSL Conseil',
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      images: [logoUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      images: [logoUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const locale = params.locale as typeof locales[number]
  if (!locales.includes(locale)) notFound()

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <NotificationProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </NotificationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}