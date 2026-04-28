"use client"

import * as React from "react"
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

export default function AdminReviewsPage() {
  const [reviews, setReviews] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews') // I should update GET in route.ts to handle admin access
      const data = await res.json()
      setReviews(data)
    } catch (error) {
      toast.error("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchReviews()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("Review deleted")
        fetchReviews()
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast.error("Delete failed")
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
        toast.success(current ? "Review hidden" : "Review published")
        fetchReviews()
      }
    } catch (error) {
      toast.error("Update failed")
    }
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Review Moderation</h1>
          <p className="text-slate-500 font-medium">Manage and moderate platform feedback.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-8">Client</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Type</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Target</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Rating</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Comment</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Status</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-right px-8">Actions</TableHead>
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
                      <CheckCircle className="w-3 h-3" /> Published
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-600 border-none gap-1">
                      <ShieldAlert className="w-3 h-3" /> Hidden
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
            No reviews found.
          </div>
        )}
      </div>
    </div>
  )
}
