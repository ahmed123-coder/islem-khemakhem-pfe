import ConsultantSidebar from '@/components/ConsultantSidebar'

export default function ConsultantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <ConsultantSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
