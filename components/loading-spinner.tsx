"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  message?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ 
  message = "Loading...", 
  className,
  size = "md" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  }

  return (
    <div className={cn("flex items-center justify-center h-full w-full min-h-[400px]", className)}>
      <div className="text-center space-y-4">
        <Loader2 className={cn("animate-spin text-primary mx-auto", sizeClasses[size])} />
        {message && (
          <p className="text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  )
}


