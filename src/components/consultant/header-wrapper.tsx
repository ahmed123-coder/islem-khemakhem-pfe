'use client'

import * as React from 'react'
import { ConsultantHeader } from './header'

export function ConsultantHeaderWithUser() {
  const [user, setUser] = React.useState<{ name: string; email: string } | null>(null)

  React.useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(res => setUser(res.data || res))
      .catch(() => {})
  }, [])

  return <ConsultantHeader user={user} />
}
