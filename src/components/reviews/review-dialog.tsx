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
}

export function ReviewDialog({ type, targetId, title, trigger }: ReviewDialogProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2 text-[10px] font-black uppercase tracking-widest border-blue-200 text-blue-600 hover:bg-blue-50">
            <Star className="w-3 h-3" /> Laisser un avis
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
            Votre avis compte
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Partagez votre expérience concernant {title}.
          </DialogDescription>
        </DialogHeader>
        <ReviewForm 
          type={type} 
          targetId={targetId} 
          onSuccess={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  )
}
