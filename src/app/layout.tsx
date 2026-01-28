import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'ConsultPro - Business Consulting & Management Solutions',
    template: '%s | ConsultPro'
  },
  description: 'Leading business consulting firm specializing in strategic management, HR solutions, quality assurance, and performance optimization. Transform your business with expert consulting services.',
  keywords: ['business consulting', 'management consulting', 'HR solutions', 'quality management', 'performance optimization', 'strategic planning'],
  authors: [{ name: 'ConsultPro' }],
  creator: 'ConsultPro',
  publisher: 'ConsultPro',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://consultpro.com',
    siteName: 'ConsultPro',
    title: 'ConsultPro - Business Consulting & Management Solutions',
    description: 'Leading business consulting firm specializing in strategic management, HR solutions, quality assurance, and performance optimization.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ConsultPro - Business Consulting & Management Solutions',
    description: 'Leading business consulting firm specializing in strategic management, HR solutions, quality assurance, and performance optimization.',
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
        <link rel="canonical" href="https://consultpro.com" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}