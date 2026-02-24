import ClientSidebar from '@/components/ClientSidebar'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <ClientSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
