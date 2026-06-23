import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopBar } from "@/components/admin/top-bar"
import { getAuthToken, verifyToken } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

export default async function AdminLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  const { locale } = params
  const token = await getAuthToken()
  if (!token) redirect(`/${locale}/login`)

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') redirect(`/${locale}`)

  return (
    <DashboardLayout
      theme="admin"
      sidebar={<AdminSidebar />}
      header={<AdminTopBar />}
    >
      {children}
    </DashboardLayout>
  )
}

