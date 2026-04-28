"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Rating } from "@/components/ui/rating"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface ReviewFormProps {
  type: 'CONSULTANT' | 'SERVICE'
  targetId: string // orderId
  onSuccess?: () => void
}

export function ReviewForm({ type, targetId, onSuccess }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = React.useState(5)
  const [comment, setComment] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          rating,
          comment,
          orderId: targetId
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      toast.success('Merci pour votre avis !')
      setComment("")
      setRating(5)
      onSuccess?.()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Note globale</label>
        <Rating 
          value={rating} 
          onChange={setRating} 
          size={32} 
          className="py-2"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Votre commentaire (optionnel)</label>
        <Textarea
          placeholder="Dites-nous ce que vous en avez pensé..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[120px] resize-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold rounded-xl transition-all hover:shadow-lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          'Publier mon avis'
        )}
      </Button>
    </form>
  )
}
