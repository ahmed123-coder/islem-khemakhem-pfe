"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "react-hot-toast"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Rating } from "@/components/ui/rating"
import { Trash2, ShieldAlert, CheckCircle } from "lucide-react"
import { StandardPage } from "@/components/admin/standard-page"

export default function AdminReviewsPage() {
  const t = useTranslations("adminPage.reviews")
  const commonT = useTranslations("common")
  const [reviews, setReviews] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchReviews = React.useCallback(async () => {
    try {
      const res = await fetch('/api/reviews') 
      const result = await res.json()
      const data = result.data || result || []
      setReviews(data)
    } catch (error) {
      toast.error("Failed to load reviews")
    } finally {
setLoading(false)
    }
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm(commonT("delete") + "?")) return

    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(commonT("success"))
        fetchReviews()
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast.error(commonT("error"))
    }
  }

  const togglePublish = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !current })
      })
      if (res.ok) {
        toast.success(current ? t("status.hidden") : t("status.published"))
        fetchReviews()
      }
    } catch (error) {
      toast.error(commonT("error"))
    }
  }

  return (
    <StandardPage
      title={t("title")}
      description={t("description")}
      breadcrumbs={[{ label: "Dashboard" }, { label: t("title") }]}
    >
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-8">{t("columns.client")}</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">{t("columns.type")}</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">{t("columns.target")}</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">{t("columns.rating")}</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">{t("columns.comment")}</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">{t("columns.status")}</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-right px-8">{t("columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="px-8 py-6 font-bold text-slate-900">
                  {review.client?.name || 'Unknown'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest rounded-lg">
                    {review.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs font-bold text-slate-500">
                  {review.type === 'CONSULTANT' 
                    ? (review.consultant?.name || 'Expert') 
                    : (review.service?.name || 'Service')}
                </TableCell>
                <TableCell>
                  <Rating value={review.rating} readonly size={14} />
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-xs text-slate-600">
                  {review.comment}
                </TableCell>
                <TableCell>
                  {review.isPublished ? (
                    <Badge className="bg-emerald-100 text-emerald-600 border-none gap-1">
                      <CheckCircle className="w-3 h-3" /> {t("status.published")}
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-600 border-none gap-1">
                      <ShieldAlert className="w-3 h-3" /> {t("status.hidden")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="px-8 text-right space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => togglePublish(review.id, review.isPublished)}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => handleDelete(review.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {reviews.length === 0 && !loading && (
          <div className="p-20 text-center text-slate-400 font-bold italic">
            {t("noReviews")}
          </div>
        )}
      </div>
    </StandardPage>
  )
}
