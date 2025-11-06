"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Scale, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      // Auto-redirect to dashboard if already logged in
      if (user) {
        router.push("/dashboard")
      }
    }
    checkAuth()
  }, [supabase, router])

  const handleLogin = () => {
    router.push("/login")
  }

  const handleSignUp = () => {
    router.push("/register")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden animate-in fade-in duration-500">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Main Content */}
      <div className="text-center space-y-8 relative z-10 px-4">
        {/* Logo/Title */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl animate-pulse">
            <Scale className="w-16 h-16 md:w-20 md:h-20 text-white" />
          </div>
          <h1 className="text-7xl md:text-9xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
            FIRM AI
          </h1>
        </div>

        {/* Small Aesthetic Button */}
        <div className="pt-8 opacity-0 animate-[fadeIn_0.6s_ease-in-out_0.3s_forwards]">
            <Button 
              onClick={handleSignUp}
              className="group relative px-6 py-3 h-auto bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2 text-sm font-medium">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
            <div className="mt-4">
              <button
                onClick={handleLogin}
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 underline-offset-4 hover:underline"
              >
                or sign in
              </button>
            </div>
          </div>
      </div>
    </div>
  )
}

