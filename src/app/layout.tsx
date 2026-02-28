import type { Metadata } from 'next'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'

export const metadata: Metadata = {
  title: {
    default: 'DSL Conseil - Business Consulting & Management Solutions',
    template: '%s | DSL Conseil'
  },
  description: 'Leading business consulting firm specializing in strategic management, HR solutions, quality assurance, and performance optimization. Transform your business with expert consulting services.',
  keywords: ['business consulting', 'management consulting', 'HR solutions', 'quality management', 'performance optimization', 'strategic planning'],
  authors: [{ name: 'DSL Conseil' }],
  creator: 'DSL Conseil',
  publisher: 'DSL Conseil',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo.jpeg', type: 'image/jpeg' }
    ],
    shortcut: '/favicon.ico',
    apple: '/logo.jpeg',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://dsl-conseil.com',
    siteName: 'DSL Conseil',
    title: 'DSL Conseil - Business Consulting & Management Solutions',
    description: 'Leading business consulting firm specializing in strategic management, HR solutions, quality assurance, and performance optimization.',
    images: ['/logo.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DSL Conseil - Business Consulting & Management Solutions',
    description: 'Leading business consulting firm specializing in strategic management, HR solutions, quality assurance, and performance optimization.',
    images: ['/logo.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://dsl-conseil.com" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/logo.jpeg" type="image/jpeg" />
      </head>
      <body className="min-h-screen flex flex-col">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}