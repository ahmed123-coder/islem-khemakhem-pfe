import type { Metadata } from 'next'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'
import NotificationProvider from '@/components/notifications/notification-provider'
import { prisma } from '@/lib/prisma'

export async function generateMetadata(): Promise<Metadata> {
  const logoContent = await prisma.siteContent.findUnique({
    where: { key: 'logo' },
  })
  let logoUrl = '/logo-1772242356501-removebg-preview.png'
  if (logoContent && logoContent.value && (logoContent.value as any).url) {
    logoUrl = (logoContent.value as any).url
  }

  return {
    title: {
      default: 'DSL Conseil - Business Consulting & Management Solutions',
      template: '%s | DSL Conseil'
    },
    description: 'Leading business consulting firm specializing in strategic management, HR solutions, quality assurance, and performance optimization. Transform your business with expert consulting services.',
    keywords: ['business consulting', 'management consulting', 'HR solutions', 'quality management', 'performance optimization', 'strategic planning'],
    authors: [{ name: 'DSL Conseil' }],
    creator: 'DSL Conseil',
    publisher: 'DSL Conseil',
    alternates: {
      canonical: 'https://dsl-conseil.com',
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
      locale: 'fr_FR',
      url: 'https://dsl-conseil.com',
      siteName: 'DSL Conseil',
      title: 'DSL Conseil - Business Consulting & Management Solutions',
      description: 'Leading business consulting firm specializing in strategic management, HR solutions, quality assurance, and performance optimization.',
      images: [logoUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'DSL Conseil - Business Consulting & Management Solutions',
      description: 'Leading business consulting firm specializing in strategic management, HR solutions, quality assurance, and performance optimization.',
      images: [logoUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <NotificationProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </NotificationProvider>
      </body>
    </html>
  )
}