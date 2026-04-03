'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterClientRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/register') }, [])
  return null
}
