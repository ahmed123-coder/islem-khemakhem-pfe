import ClientSidebar from '@/components/ClientSidebar'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <ClientSidebar />
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  )
}
