'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User, Mail, Briefcase } from 'lucide-react'

export default function ConsultantSettingsPage() {
  const t = useTranslations("consultantPage.settings")
  const [profile, setProfile] = useState({ name: '', email: '', specialty: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/consultant/profile')
      .then(r => r.json())
      .then(data => setProfile(data))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    await fetch('/api/consultant/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    })
    alert(t("profileUpdated"))
  }

  if (loading) return <div className="p-8">{t("loading")}</div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-600 mt-2">{t("description")}</p>
      </div>

      <div className="max-w-2xl">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{t("profileInfo")}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{t("fullName")}</span>
                </div>
              </label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder={t("placeholderName")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>{t("email")}</span>
                </div>
              </label>
              <Input
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} />
                  <span>{t("specialty")}</span>
                </div>
              </label>
              <Input
                value={profile.specialty}
                onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                placeholder={t("placeholderSpecialty")}
              />
            </div>

            <Button onClick={handleSave} className="w-full">
              {t("saveChanges")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
