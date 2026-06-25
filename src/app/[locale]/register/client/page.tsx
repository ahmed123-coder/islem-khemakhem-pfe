'use client'
import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function RegisterClientRedirect() {
  const { locale } = useParams() as { locale: string }
  const router = useRouter()
  useEffect(() => { router.replace(`/${locale}/register`) }, [locale])
  return null
}
