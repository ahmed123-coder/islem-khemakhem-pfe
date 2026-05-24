'use client'
import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function RegisterConsultantRedirect() {
  const { locale } = useParams()
  const router = useRouter()
  useEffect(() => { router.replace(`/${locale}/register`) }, [locale])
  return null
}
