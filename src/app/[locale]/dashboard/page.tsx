import { getCurrentUser } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const user = await getCurrentUser()
  const t = await getTranslations('dashboard')

  if (!user) {
    redirect(`/${locale}/login`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{t('common.dashboard')}</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-lg">{t('common.welcomeUser', { name: user.name || user.email })}</p>
          <p className="text-gray-600 mt-2">{t('common.role', { role: user.role })}</p>
        </div>
      </div>
    </div>
  )
}
