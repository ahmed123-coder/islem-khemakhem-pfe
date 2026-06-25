'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Star, MessageSquare, Calendar, User, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Rating } from '@/components/ui/rating'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function ConsultantReviewsPage() {
  const { locale } = useParams() as { locale: string }
  const t = useTranslations("consultantPage.reviews")
  const [reviews, setReviews] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/consultant/reviews')
      .then(r => r.json())
      .then(res => {
        const data = res.data || res
        if (Array.isArray(data)) setReviews(data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-12 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  )

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href={`/${locale}/consultant`} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-xs uppercase tracking-widest transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> {t("backToDashboard")}
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            {t("title").split(' ')[0]} <span className="text-emerald-600 font-serif italic font-normal">{t("title").split(' ').slice(1).join(' ')}</span>.
          </h1>
          <p className="text-slate-500 font-bold text-sm">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {reviews.length > 0 ? (
          reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="rounded-[2.5rem] border-none shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden bg-white">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                            <User className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 leading-none">
                              {review.client.firstName} {review.client.name}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                              {t("clientVerified")}
                            </p>
                          </div>
                        </div>
                        <Rating value={review.rating} readonly size={20} />
                      </div>

                      <div className="relative">
                        <div className="absolute -left-4 top-0 text-slate-100 text-6xl font-serif leading-none">"</div>
                        <p className="text-slate-600 font-medium leading-relaxed relative z-10 pl-2 italic">
                          {review.comment || t("noComment")}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600">
                          <Star className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {t("rating")}: {review.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="md:w-64 space-y-4">
                      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("relatedService")}</p>
                        <p className="text-xs font-black text-slate-900 leading-tight">
                          {review.order?.serviceTier?.service?.name || "Service tiers"}
                        </p>
                        <Badge className="bg-white text-slate-500 border-slate-100 text-[9px] font-black uppercase">
                          {review.order?.serviceTier?.tierType} Access
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center space-y-6 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto shadow-sm">
              <MessageSquare className="w-8 h-8 text-slate-200" />
            </div>
            <div className="space-y-2">
              <p className="text-slate-900 font-black text-xl">{t("noFeedback")}</p>
              <p className="text-slate-400 font-bold text-sm">{t("noFeedbackDesc")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
