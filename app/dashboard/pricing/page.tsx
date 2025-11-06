"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Check, 
  Crown, 
  Sparkles,
  ArrowRight,
  Loader2,
  Zap,
  Building2,
  CheckCircle2,
  Mail
} from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/lib/products"
import { createClient } from "@/lib/supabase/client"

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string>("free")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("subscription_tier").eq("id", user.id).single()

        if (profile) {
          setCurrentPlan(profile.subscription_tier || "free")
        }
      }
    }

    getSubscription()
  }, [supabase])

  const handleSubscribe = async (planId: string) => {
    if (planId === "free") return

    setLoading(true)
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free":
        return <Sparkles className="w-6 h-6" />
      case "pro":
        return <Crown className="w-6 h-6" />
      case "enterprise":
        return <Building2 className="w-6 h-6" />
      default:
        return <Zap className="w-6 h-6" />
    }
  }

  const getPlanGradient = (planId: string) => {
    switch (planId) {
      case "free":
        return "from-firm-black-700 to-firm-black-800"
      case "pro":
        return "from-firm-red-600 to-firm-red-700"
      case "enterprise":
        return "from-firm-red-500 to-firm-red-600"
      default:
        return "from-firm-red-600 to-firm-red-700"
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-firm-black-950 via-firm-black-900 to-firm-black-950">
      <div className="p-6 md:p-8 space-y-8 max-w-[1800px] mx-auto">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-firm-red-600/20 bg-gradient-to-br from-firm-black-900 via-firm-black-800 to-firm-black-900 p-8 md:p-10">
          {/* Animated Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-firm-red-600/10 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10 text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-4 bg-firm-red-600/20 rounded-2xl border-2 border-firm-red-600/30 shadow-lg shadow-firm-red-600/20">
                <Crown className="w-10 h-10 text-firm-red-500" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
              Upgrade Your <span className="text-firm-red-500">Learning</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choose the perfect plan to master law. All plans include access to our AI-powered legal learning platform.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id
            const isPro = plan.id === "pro"
            const gradient = getPlanGradient(plan.id)
            const Icon = getPlanIcon(plan.id)

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col border-2 transition-all duration-300 ${
                  isPro
                    ? "md:scale-105 border-firm-red-600 shadow-2xl shadow-firm-red-600/20 ring-2 ring-firm-red-600/30 bg-gradient-to-br from-firm-black-900 to-firm-black-800"
                    : "border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800 hover:border-firm-red-600/50"
                } ${isCurrentPlan ? "ring-2 ring-firm-red-600 border-firm-red-600" : ""}`}
              >
                {isPro && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-firm-red-600 to-firm-red-700 text-white px-4 py-1.5 text-sm font-bold shadow-lg shadow-firm-red-600/30 border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-firm-red-600 text-white border-0 font-bold">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Current
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4 border-b border-firm-black-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                      {Icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-black text-white">{plan.name}</CardTitle>
                      <CardDescription className="mt-1 text-gray-400">{plan.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-6 pt-6">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white">
                        {plan.price === 0 ? "Free" : `$${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-sm text-gray-500 font-medium">/month</span>
                      )}
                    </div>
                    {plan.price === 0 ? (
                      <p className="text-sm text-firm-red-500 font-bold mt-1">Always free</p>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1 font-medium">
                        Billed monthly • Cancel anytime
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-firm-red-600/20 mt-0.5 border border-firm-red-600/30">
                          <Check className="w-4 h-4 text-firm-red-500" />
                        </div>
                        <span className="text-sm text-gray-300 leading-relaxed font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full h-12 font-bold ${
                      isCurrentPlan
                        ? "bg-firm-red-600 hover:bg-firm-red-700 text-white"
                        : isPro
                        ? "bg-firm-red-600 hover:bg-firm-red-700 text-white shadow-lg shadow-firm-red-600/30"
                        : "border-2 border-firm-black-700 bg-firm-black-800 text-white hover:bg-firm-black-700 hover:border-firm-red-600/50"
                    } transition-all duration-300`}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrentPlan || loading}
                  >
                    {isCurrentPlan ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Current Plan
                      </>
                    ) : plan.id === "free" ? (
                      "Downgrade"
                    ) : loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Upgrade Now
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Enterprise Contact Card */}
        <Card className="border-2 border-firm-red-600/30 bg-gradient-to-br from-firm-red-600/5 via-firm-black-900 to-firm-black-900">
          <CardHeader className="border-b border-firm-black-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-firm-red-600/20 rounded-lg">
                  <Building2 className="w-6 h-6 text-firm-red-500" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-white">Need custom pricing?</CardTitle>
                  <CardDescription className="text-gray-400 mt-1">
                    Contact our team for enterprise solutions and custom integrations
                  </CardDescription>
                </div>
              </div>
              <Button 
                className="bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30 h-11"
                onClick={() => {
                  window.location.href = "mailto:sales@firmai.com?subject=Enterprise Inquiry"
                }}
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact Sales
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Features Comparison - Optional Enhancement */}
        <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
          <CardHeader className="border-b border-firm-black-700">
            <div className="text-center">
              <CardTitle className="text-3xl font-black text-white">Why Upgrade?</CardTitle>
              <CardDescription className="text-gray-400 mt-2 text-lg">
                Unlock the full potential of AI-powered legal learning
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-3 p-6 rounded-xl border-2 border-firm-black-700 bg-firm-black-800/50 hover:border-firm-red-600/50 transition-all">
                <div className="p-3 bg-firm-red-600/20 rounded-full w-fit mx-auto">
                  <Zap className="w-8 h-8 text-firm-red-500" />
                </div>
                <h3 className="font-black text-xl text-white">Unlimited Access</h3>
                <p className="text-sm text-gray-400">Upload and analyze unlimited cases with advanced AI</p>
              </div>
              <div className="text-center space-y-3 p-6 rounded-xl border-2 border-firm-black-700 bg-firm-black-800/50 hover:border-firm-red-600/50 transition-all">
                <div className="p-3 bg-firm-red-600/20 rounded-full w-fit mx-auto">
                  <Crown className="w-8 h-8 text-firm-red-500" />
                </div>
                <h3 className="font-black text-xl text-white">Priority Support</h3>
                <p className="text-sm text-gray-400">Get help when you need it with priority email support</p>
              </div>
              <div className="text-center space-y-3 p-6 rounded-xl border-2 border-firm-black-700 bg-firm-black-800/50 hover:border-firm-red-600/50 transition-all">
                <div className="p-3 bg-firm-red-600/20 rounded-full w-fit mx-auto">
                  <Sparkles className="w-8 h-8 text-firm-red-500" />
                </div>
                <h3 className="font-black text-xl text-white">Advanced Features</h3>
                <p className="text-sm text-gray-400">Access AI study recommendations and custom templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
