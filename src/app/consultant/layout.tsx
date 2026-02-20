import ConsultantSidebar from '@/components/ConsultantSidebar'

export default function ConsultantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <ConsultantSidebar />
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  )
}
