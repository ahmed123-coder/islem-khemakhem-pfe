import ClientSidebar from '@/components/ClientSidebar'
import Header from '@/components/Header'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <ClientSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Tableau de bord Client" />
        <main className="flex-1 overflow-y-auto p-0">{children}</main>
      </div>
    </div>
  )
}
