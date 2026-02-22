'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, CreditCard, Calendar } from 'lucide-react'

export default function ClientSettingsPage() {
  const [profile, setProfile] = useState({ name: '', email: '' })
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/client/profile').then(r => r.json()),
      fetch('/api/client/subscription').then(r => r.json())
    ]).then(([profileData, subData]) => {
      setProfile(profileData)
      setSubscription(subData)
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    await fetch('/api/client/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    })
    alert('Profile updated successfully')
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your profile and subscription</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>Full Name</span>
                </div>
              </label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>Email</span>
                </div>
              </label>
              <Input
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Subscription Card */}
        {subscription && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Subscription</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={20} className="text-gray-600" />
                  <span className="text-gray-700">Plan</span>
                </div>
                <Badge variant="default">{subscription.plan}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-gray-600" />
                  <span className="text-gray-700">Status</span>
                </div>
                <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {subscription.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700">Billing Cycle</span>
                <span className="font-medium">{subscription.billingCycle}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700">Next Billing Date</span>
                <span className="font-medium">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </span>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  Manage Subscription
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
