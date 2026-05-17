import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopBar } from "@/components/admin/top-bar"
import { getAuthToken, verifyToken } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = await getAuthToken()
  if (!token) redirect('/login')

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') redirect('/')

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

