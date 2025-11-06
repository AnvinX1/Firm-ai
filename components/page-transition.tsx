"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setIsTransitioning(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname, children])

  return (
    <div
      className={`
        ${isTransitioning ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"} 
        transition-all duration-300 ease-out
      `}
    >
      {displayChildren}
    </div>
  )
}


