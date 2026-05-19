'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, CreditCard, Calendar } from 'lucide-react'

export default function ClientSettingsPage() {
  const t = useTranslations('clientPage.settings')
  const [profile, setProfile] = useState({ name: '', email: '' })
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/client/profile').then(r => r.json()),
      fetch('/api/client/subscription').then(r => r.json())
    ]).then(([profileRes, subRes]) => {
      setProfile(profileRes.data || profileRes)
      setSubscription(subRes.data || subRes)
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    await fetch('/api/client/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    })
    alert(t('profileUpdated'))
  }

  if (loading) return <div className="p-8">{t('loading')}</div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-2">{t('description')}</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('profileInfo')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{t('fullName')}</span>
                </div>
              </label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder={t('namePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>{t('email')}</span>
                </div>
              </label>
              <Input value={profile.email} disabled className="bg-gray-50" />
            </div>
            <Button onClick={handleSave} className="w-full">{t('saveChanges')}</Button>
          </div>
        </Card>

        {subscription && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('subscription')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={20} className="text-gray-600" />
                  <span className="text-gray-700">{t('plan')}</span>
                </div>
                <Badge variant="default">{subscription.plan}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-gray-600" />
                  <span className="text-gray-700">{t('status')}</span>
                </div>
                <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {subscription.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{t('billingCycle')}</span>
                <span className="font-medium">{subscription.billingCycle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{t('nextBillingDate')}</span>
                <span className="font-medium">{new Date(subscription.endDate).toLocaleDateString()}</span>
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">{t('manageSubscription')}</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
