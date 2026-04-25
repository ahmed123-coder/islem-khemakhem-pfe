'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Clock, CheckCircle2, AlertCircle, ReceiptText } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/client/invoices')
      const data = await res.json()
      setInvoices(data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case 'PENDING': return <Clock className="w-4 h-4 text-amber-500" />
      case 'UNPAID': return <AlertCircle className="w-4 h-4 text-rose-500" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Chargement des documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#F8FAFC] p-8 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Facturation</h1>
          </div>
          <p className="text-slate-500 font-medium">Consultez et téléchargez vos factures et l'historique de vos paiements.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {invoices.length === 0 ? (
            <Card className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center bg-white/50">
               <ReceiptText className="w-16 h-16 text-slate-200 mx-auto mb-6" />
               <h3 className="text-xl font-black text-slate-900 mb-2">Aucune facture disponible</h3>
               <p className="text-slate-500 font-medium max-w-sm mx-auto">Vos documents apparaîtront ici dès que vos commandes seront traitées.</p>
            </Card>
          ) : (
            invoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 group">
                  <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <FileText className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-black text-slate-900">{invoice.invoiceNumber}</h3>
                          <Badge className={`border-none px-3 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 ${
                            invoice.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </Badge>
                        </div>
                        <p className="text-xs font-bold text-slate-400">
                          Pour: <span className="text-slate-600">{invoice.order?.serviceTier?.service?.name || 'Service Expertise'}</span> · Émis le {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="text-center md:text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Montant</p>
                        <p className="text-2xl font-black text-slate-900">{invoice.amount} €</p>
                      </div>
                      
                      <div className="h-12 w-[1px] bg-slate-100 hidden md:block" />

                      <a href={`/api/client/invoices/${invoice.id}/download`} target="_blank" rel="noopener noreferrer">
                        <Button className="h-14 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl transition-all group">
                          Télécharger <Download className="w-4 h-4 ml-2 opacity-30 group-hover:opacity-100 transition-opacity" />
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
