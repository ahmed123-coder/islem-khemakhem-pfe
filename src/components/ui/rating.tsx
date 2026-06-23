"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingProps {
  value: number
  onChange?: (value: number) => void
  max?: number
  readonly?: boolean
  className?: string
  size?: number
}

export function Rating({
  value,
  onChange,
  max = 5,
  readonly = false,
  className,
  size = 20,
}: RatingProps) {
  const [hoveredValue, setHoveredValue] = React.useState<number | null>(null)

  const stars = Array.from({ length: max }, (_, i) => i + 1)

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={cn(
            "transition-all duration-200 focus:outline-none",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110",
            (hoveredValue !== null ? star <= hoveredValue : star <= value)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300 fill-transparent"
          )}
          onMouseEnter={() => !readonly && setHoveredValue(star)}
          onMouseLeave={() => !readonly && setHoveredValue(null)}
          onClick={() => !readonly && onChange?.(star)}
        >
          <Star size={size} strokeWidth={2} />
        </button>
      ))}
    </div>
  )
}
