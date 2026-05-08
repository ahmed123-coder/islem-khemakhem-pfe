import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopBar } from "@/components/admin/top-bar"
import { Toaster } from "react-hot-toast"
import { getAuthToken, verifyToken } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = await getAuthToken()
  if (!token) redirect('/login')

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') redirect('/')

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 lg:p-10 mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
