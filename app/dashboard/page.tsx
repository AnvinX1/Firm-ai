"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Scale, 
  TrendingUp, 
  BookOpen, 
  Award, 
  Target, 
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
  FileText,
  PlayCircle,
  Calendar,
  Crown,
  Activity
} from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { getCases, getQuizzes, getStudyPlans } from "@/lib/supabase/client-actions"

export default function DashboardPage() {
  const [subscriptionTier, setSubscriptionTier] = useState("free")
  const [userName, setUserName] = useState("")
  const [recentCases, setRecentCases] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [studyPlans, setStudyPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const supabase = createBrowserClient()
        const { data: authData } = await supabase.auth.getUser()

        if (!authData?.user) {
          router.push("/login")
          return
        }

        setUserName(authData.user.email?.split("@")[0] || "User")

        const [casesData, quizzesData, plansData] = await Promise.all([
          getCases(authData.user.id),
          getQuizzes(authData.user.id),
          getStudyPlans(authData.user.id),
        ])

        setRecentCases((casesData || []).slice(0, 3))
        setQuizzes(quizzesData || [])
        setStudyPlans(plansData || [])

      } catch (error) {
        console.error("Error loading dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [router])

  const stats = [
    {
      label: "Cases Analyzed",
      value: recentCases.length,
      change: "+3 this week",
      icon: Scale,
      gradient: "from-firm-red-600 to-firm-red-700",
    },
    {
      label: "Quiz Score",
      value: `${Math.floor(Math.random() * 30 + 70)}%`,
      change: "+5% improvement",
      icon: Award,
      gradient: "from-firm-black-700 to-firm-black-800",
    },
    {
      label: "Study Streak",
      value: `${Math.floor(Math.random() * 10 + 5)} days`,
      change: "Keep it up!",
      icon: Target,
      gradient: "from-firm-red-500 to-firm-red-600",
    },
    {
      label: "Active Plans",
      value: studyPlans.length,
      change: "On track",
      icon: Calendar,
      gradient: "from-firm-black-600 to-firm-black-700",
    },
  ]

  const quickActions = [
    {
      title: "Analyze New Case",
      description: "Upload and get AI-powered IRAC analysis",
      icon: FileText,
      href: "/dashboard/cases",
      color: "red",
      gradient: "from-firm-red-600/20 to-firm-red-700/10",
      border: "border-firm-red-600/30",
      glow: "group-hover:shadow-firm-red-600/20",
    },
    {
      title: "AI Tutor Chat",
      description: "Get instant help with legal concepts",
      icon: Brain,
      href: "/dashboard/tutor",
      color: "black",
      gradient: "from-firm-black-800/40 to-firm-black-900/20",
      border: "border-firm-black-700/50",
      glow: "group-hover:shadow-firm-black-700/30",
    },
    {
      title: "Practice Quiz",
      description: "Test your knowledge with flashcards",
      icon: Sparkles,
      href: "/dashboard/quizzes",
      color: "red",
      gradient: "from-firm-red-500/20 to-firm-red-600/10",
      border: "border-firm-red-500/30",
      glow: "group-hover:shadow-firm-red-500/20",
    },
    {
      title: "Mock Test",
      description: "Take a comprehensive exam simulation",
      icon: PlayCircle,
      href: "/dashboard/mock-tests",
      color: "black",
      gradient: "from-firm-black-700/40 to-firm-black-800/20",
      border: "border-firm-black-600/50",
      glow: "group-hover:shadow-firm-black-600/30",
    },
  ]

  if (loading) {
    return null
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-firm-black-950 via-firm-black-900 to-firm-black-950">
      <div className="p-6 md:p-8 space-y-8 max-w-[1800px] mx-auto">
        {/* Hero Header with Red Accent */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-firm-red-600/20 bg-gradient-to-br from-firm-black-900 via-firm-black-800 to-firm-black-900 p-8 md:p-10">
          {/* Animated Red Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-firm-red-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-firm-red-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-firm-red-600/20 rounded-xl border border-firm-red-600/30">
                  <Activity className="w-8 h-8 text-firm-red-500" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                    Welcome back, <span className="text-firm-red-500">{userName}</span>
                  </h1>
                  <p className="text-lg text-gray-400 mt-2">
                    Your legal AI command center
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge 
                className="px-5 py-3 text-base font-bold bg-firm-red-600 hover:bg-firm-red-700 text-white border-0 shadow-lg shadow-firm-red-600/30"
              >
                <Crown className="w-5 h-5 mr-2" />
                <span className="uppercase tracking-wide">{subscriptionTier} Plan</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Grid - Bold & Modern */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div 
                key={idx} 
                className="group relative h-full"
              >
                {/* Glow effect on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-firm-red-600 to-firm-red-700 rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-500" />
                
                <Card className="relative h-full border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800 hover:border-firm-red-600/50 transition-all duration-300">
                  <CardContent className="pt-6 h-full">
                    <div className="flex items-start justify-between h-full">
                      <div className="space-y-2 flex-1">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide line-clamp-1">{stat.label}</p>
                        <p className="text-4xl md:text-5xl font-black text-white">{stat.value}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                          <TrendingUp className="w-4 h-4 text-firm-red-500" />
                          <span className="font-medium line-clamp-1">{stat.change}</span>
                        </div>
                      </div>
                      <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-xl flex-shrink-0`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Quick Actions - Red Accent Cards */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-firm-red-600 rounded-full" />
            <h2 className="text-3xl font-black text-white">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickActions.map((action, idx) => {
              const Icon = action.icon
              return (
                <Link key={idx} href={action.href} className="group h-full block">
                  <Card className={`
                    relative overflow-hidden border-2 ${action.border} 
                    bg-gradient-to-br ${action.gradient}
                    hover:border-firm-red-600/80 transition-all duration-300 
                    hover:scale-105 ${action.glow} hover:shadow-2xl
                    h-full flex flex-col
                  `}>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="space-y-4 flex-1 flex flex-col">
                        <div className="flex items-start justify-between">
                          <div className={`
                            p-3 rounded-xl flex-shrink-0
                            ${action.color === 'red' ? 'bg-firm-red-600/20 border border-firm-red-600/30' : 'bg-firm-black-700/40 border border-firm-black-600/50'}
                            group-hover:scale-110 transition-transform duration-300
                          `}>
                            <Icon className={`
                              w-6 h-6 
                              ${action.color === 'red' ? 'text-firm-red-500' : 'text-gray-300'}
                            `} />
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-firm-red-500 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <h3 className="text-xl font-bold text-white group-hover:text-firm-red-500 transition-colors line-clamp-2">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Cases */}
          <Card className="lg:col-span-2 border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800 hover:border-firm-red-600/30 transition-all duration-300 flex flex-col">
            <CardHeader className="pb-4 border-b border-firm-black-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-firm-red-600/20 rounded-lg flex-shrink-0">
                    <FileText className="w-5 h-5 text-firm-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-white">Recent Cases</CardTitle>
                    <CardDescription className="text-gray-500 mt-1">Your latest analyses</CardDescription>
                  </div>
                </div>
                <Link href="/dashboard/cases">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-gray-400 hover:text-firm-red-500 hover:bg-firm-red-600/10 flex-shrink-0"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col">
              {recentCases.length > 0 ? (
                <div className="space-y-3">
                  {recentCases.map((case_) => (
                    <Link 
                      key={case_.id} 
                      href="/dashboard/cases"
                      className="block group"
                    >
                      <div className="flex items-center gap-4 p-4 border-2 border-firm-black-700 rounded-xl hover:border-firm-red-600/50 hover:bg-firm-black-800/50 transition-all duration-200">
                        <div className="p-3 bg-firm-red-600/20 rounded-lg border border-firm-red-600/30 group-hover:bg-firm-red-600/30 transition-colors flex-shrink-0">
                          <Scale className="w-5 h-5 text-firm-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white group-hover:text-firm-red-500 transition-colors truncate">
                            {case_.title || "Untitled Case"}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(case_.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-firm-red-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-firm-black-800 rounded-full flex items-center justify-center border-2 border-firm-black-700">
                    <FileText className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500 mb-4">No cases analyzed yet</p>
                  <Link href="/dashboard/cases">
                    <Button className="bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold">
                      <Zap className="w-4 h-4 mr-2" />
                      Analyze Your First Case
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Study Progress */}
          <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800 hover:border-firm-red-600/30 transition-all duration-300 flex flex-col">
            <CardHeader className="pb-4 border-b border-firm-black-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-firm-red-600/20 rounded-lg flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-firm-red-500" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-white">Study Goals</CardTitle>
                  <CardDescription className="text-gray-500">This week</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6 flex-1 flex flex-col">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-400">Weekly Target</span>
                  <span className="text-sm font-bold text-white">75%</span>
                </div>
                <div className="h-3 bg-firm-black-800 rounded-full overflow-hidden border border-firm-black-700">
                  <div className="h-full bg-gradient-to-r from-firm-red-600 to-firm-red-500 rounded-full shadow-lg shadow-firm-red-600/50" style={{ width: '75%' }} />
                </div>
              </div>

              <div className="space-y-3 flex-1">
                {[
                  { label: "Cases Analyzed", value: "3/5", percent: 60 },
                  { label: "Quiz Completed", value: "2/3", percent: 66 },
                  { label: "Study Hours", value: "8/10", percent: 80 },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-firm-black-800/50 rounded-lg border border-firm-black-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-400">{item.label}</span>
                      <span className="text-xs font-bold text-white">{item.value}</span>
                    </div>
                    <div className="h-2 bg-firm-black-700 rounded-full overflow-hidden">
                      <div className="h-full bg-firm-red-600 rounded-full" style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/dashboard/planner" className="flex-shrink-0">
                <Button className="w-full bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30">
                  <Target className="w-4 h-4 mr-2" />
                  View Study Plan
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
