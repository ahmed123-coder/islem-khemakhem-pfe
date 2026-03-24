import ConsultantSidebar from '@/components/ConsultantSidebar'
import Header from '@/components/Header'

export default function ConsultantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <ConsultantSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Espace Consultant" />
        <main className="flex-1 overflow-y-auto p-0">
          {children}
        </main>
      </div>
    </div>
  )
}
