import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ServiceCardProps {
  title: string
  description: string
  icon: string
}

export default function ServiceCard({ title, description, icon }: ServiceCardProps) {
  return (
    <Card className="h-full group hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50/30">
      <CardContent className="p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
            Premium
          </Badge>
        </div>
        <div className="relative z-10">
          <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500 filter group-hover:drop-shadow-lg">{icon}</div>
          <h3 className="text-xl font-bold text-foreground mb-4 leading-tight group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
          <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}