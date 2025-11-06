"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { SidebarProvider } from "@/components/sidebar-context"
import { PageTransition } from "@/components/page-transition"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
      } else {
        setUser(user)
      }
      setLoading(false)
    }

    checkAuth()
  }, [router, supabase])

  if (loading || !user) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background animate-in fade-in duration-500">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader user={user} />
          <main className="flex-1 overflow-auto">
            <PageTransition>{children}</PageTransition>
          </main>
          <DashboardFooter />
        </div>
      </div>
    </SidebarProvider>
  )
}
