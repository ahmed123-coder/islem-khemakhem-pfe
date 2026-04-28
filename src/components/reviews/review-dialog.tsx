"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ReviewForm } from "./review-form"
import { Star } from "lucide-react"

interface ReviewDialogProps {
  type: 'CONSULTANT' | 'SERVICE'
  targetId: string
  title: string
  trigger?: React.ReactNode
  initialRating?: number
  initialComment?: string
  reviewId?: string
  onSuccess?: () => void
}

export function ReviewDialog({ 
  type, 
  targetId, 
  title, 
  trigger,
  initialRating,
  initialComment,
  reviewId,
  onSuccess
}: ReviewDialogProps) {
  const [open, setOpen] = React.useState(false)

  const handleSuccess = () => {
    setOpen(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2 text-[10px] font-black uppercase tracking-widest border-blue-200 text-blue-600 hover:bg-blue-50">
            <Star className="w-3 h-3" /> {reviewId ? 'Modifier mon avis' : 'Laisser un avis'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
            {reviewId ? 'Mettre à jour votre avis' : 'Votre avis compte'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Partagez votre expérience concernant {title}.
          </DialogDescription>
        </DialogHeader>
        <ReviewForm 
          type={type} 
          targetId={targetId} 
          onSuccess={handleSuccess} 
          initialRating={initialRating}
          initialComment={initialComment}
          reviewId={reviewId}
        />
      </DialogContent>
    </Dialog>
  )
}
