import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#1E293B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#F59E0B] flex items-center justify-center text-white font-bold text-xl">
                D
              </div>
              <span className="text-xl font-bold">DSL Conseil</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Cabinet de conseil en management, RH, qualité et performance. Nous accompagnons les PME dans leur transformation.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><Link href="/services" className="text-gray-400 hover:text-white transition-colors text-sm">Management</Link></li>
              <li><Link href="/services" className="text-gray-400 hover:text-white transition-colors text-sm">Ressources Humaines</Link></li>
              <li><Link href="/services" className="text-gray-400 hover:text-white transition-colors text-sm">Qualité & RSE</Link></li>
              <li><Link href="/services" className="text-gray-400 hover:text-white transition-colors text-sm">Performance</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Plateforme</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">Espace Client</Link></li>
              <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">Espace Consultant</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors text-sm">Blog & Ressources</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-[#F59E0B]" />
                <span className="text-gray-400">contact@dsl-conseil.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-[#F59E0B]" />
                <span className="text-gray-400">+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-[#F59E0B]" />
                <span className="text-gray-400">Paris, France</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; 2026 DSL Conseil. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}