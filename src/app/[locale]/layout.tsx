import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from '@/lib/i18n'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'
import NotificationProvider from '@/components/notifications/notification-provider'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale === 'fr' ? 'fr' : 'en'

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
      default: titles[locale as keyof typeof titles],
      template: '%s | DSL Conseil'
    },
    description: descriptions[locale as keyof typeof descriptions],
    alternates: {
      languages: {
        'en': '/en',
        'fr': '/fr',
      },
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
  const locale = params.locale === 'fr' ? 'fr' : 'en'
  const messages = await getMessages(locale)

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