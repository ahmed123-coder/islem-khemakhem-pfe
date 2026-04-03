'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterConsultantRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/register') }, [])
  return null
}
