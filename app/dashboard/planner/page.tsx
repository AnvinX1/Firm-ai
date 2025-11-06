"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  Flame, 
  Calendar,
  Target,
  TrendingUp,
  Plus,
  Loader2,
  Clock,
  Award,
  Activity,
  Minus
} from "lucide-react"
import { getStudyPlans, createStudyPlan } from "@/lib/supabase/client-actions"
import { createBrowserClient } from "@/lib/supabase/client"

export default function PlannerPage() {
  const [studyPlans, setStudyPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newGoal, setNewGoal] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const supabase = createBrowserClient()
        const { data: authData } = await supabase.auth.getUser()

        if (!authData?.user?.id) {
          router.push("/login")
          return
        }

        const plans = await getStudyPlans(authData.user.id)
        setStudyPlans(plans || [])
      } catch (err) {
        console.error("Error loading study plans:", err)
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [router])

  const handleAddPlan = async () => {
    if (!newGoal.trim()) return

    setIsAdding(true)
    try {
      const supabase = createBrowserClient()
      const { data: authData } = await supabase.auth.getUser()

      if (!authData?.user?.id) return

      const plan = await createStudyPlan(authData.user.id, {
        title: newGoal,
        description: newDescription || newGoal,
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        progress: 0,
      })

      setStudyPlans([plan, ...studyPlans])
      setNewGoal("")
      setNewDescription("")
    } catch (err) {
      console.error("Error creating plan:", err)
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdateProgress = async (planId: string, newProgress: number) => {
    try {
      const supabase = createBrowserClient()
      await supabase
        .from("study_plans")
        .update({ progress: Math.min(100, Math.max(0, newProgress)) })
        .eq("id", planId)

      setStudyPlans(plans =>
        plans.map(p => p.id === planId ? { ...p, progress: Math.min(100, Math.max(0, newProgress)) } : p)
      )
    } catch (err) {
      console.error("Error updating progress:", err)
    }
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (loading) {
    return null
  }

  const completedPlans = studyPlans.filter((p) => p.progress === 100).length
  const activePlans = studyPlans.filter((p) => p.progress < 100 && p.progress > 0).length
  const totalProgress =
    studyPlans.length > 0
      ? Math.round(studyPlans.reduce((sum, p) => sum + (p.progress || 0), 0) / studyPlans.length)
      : 0

  const stats = [
    {
      label: "Overall Progress",
      value: `${totalProgress}%`,
      description: "Average across all plans",
      icon: TrendingUp,
      gradient: "from-firm-red-600 to-firm-red-700",
    },
    {
      label: "Plans Completed",
      value: `${completedPlans}/${studyPlans.length || 0}`,
      description: `${studyPlans.length > 0 ? Math.round((completedPlans / studyPlans.length) * 100) : 0}% completion rate`,
      icon: CheckCircle,
      gradient: "from-firm-black-700 to-firm-black-800",
    },
    {
      label: "Active Plans",
      value: activePlans,
      description: "In progress",
      icon: Flame,
      gradient: "from-firm-red-500 to-firm-red-600",
    },
  ]

  return (
    <div className="min-h-full bg-gradient-to-br from-firm-black-950 via-firm-black-900 to-firm-black-950">
      <div className="p-6 md:p-8 space-y-8 max-w-[1800px] mx-auto">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-firm-red-600/20 bg-gradient-to-br from-firm-black-900 via-firm-black-800 to-firm-black-900 p-8 md:p-10">
          {/* Animated Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-firm-red-600/10 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-firm-red-600/20 rounded-2xl border-2 border-firm-red-600/30 shadow-lg shadow-firm-red-600/20">
                <Calendar className="w-10 h-10 text-firm-red-500" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                  Study <span className="text-firm-red-500">Planner</span>
                </h1>
                <p className="text-lg text-gray-400 mt-2">
                  Track your progress and manage your learning goals
                </p>
              </div>
            </div>
            
            <Badge className="bg-firm-black-800 text-gray-300 border-2 border-firm-red-600/30 px-4 py-2 text-sm font-bold">
              <Target className="w-4 h-4 mr-2 text-firm-red-500" />
              {studyPlans.length} {studyPlans.length === 1 ? "Plan" : "Plans"}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-firm-red-600 to-firm-red-700 rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-500" />
                
                <Card className="relative border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800 hover:border-firm-red-600/50 transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                        <p className="text-4xl font-black text-white">{stat.value}</p>
                        <p className="text-xs text-gray-600">{stat.description}</p>
                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-xl`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Study Plans Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plans List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
              <CardHeader className="border-b border-firm-black-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-firm-red-600/20 rounded-lg">
                    <Activity className="w-5 h-5 text-firm-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-white">Study Plans</CardTitle>
                    <CardDescription className="text-gray-500 mt-1">Your learning roadmap and goals</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {studyPlans.length > 0 ? (
                  studyPlans.map((plan) => {
                    const daysRemaining = plan.end_date ? getDaysRemaining(plan.end_date) : null
                    const isOverdue = daysRemaining !== null && daysRemaining < 0
                    const isCompleted = plan.progress === 100

                    return (
                      <div
                        key={plan.id}
                        className={`group relative overflow-hidden p-6 border-2 rounded-xl transition-all duration-300 ${
                          isCompleted
                            ? "border-firm-red-600 bg-firm-red-600/5"
                            : isOverdue
                            ? "border-firm-red-700 bg-firm-red-900/10"
                            : "border-firm-black-700 bg-firm-black-800/50 hover:border-firm-red-600/50 hover:bg-firm-black-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className={`p-3 rounded-lg ${
                              isCompleted
                                ? "bg-gradient-to-br from-firm-red-600 to-firm-red-700 shadow-lg shadow-firm-red-600/30"
                                : "bg-gradient-to-br from-firm-black-700 to-firm-black-800 border-2 border-firm-red-600/30"
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="w-6 h-6 text-white" />
                              ) : (
                                <Target className="w-6 h-6 text-firm-red-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-bold text-xl text-white group-hover:text-firm-red-500 transition-colors truncate">
                                  {plan.title}
                                </h3>
                                <Badge 
                                  className={`text-xs font-bold shrink-0 ${
                                    isCompleted 
                                      ? 'bg-firm-red-600 text-white border-0' 
                                      : isOverdue
                                      ? 'bg-firm-red-700 text-white border-0'
                                      : 'bg-firm-black-700 text-gray-300 border-0'
                                  }`}
                                >
                                  {plan.progress}%
                                </Badge>
                              </div>
                              {plan.description && (
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                  {plan.description}
                                </p>
                              )}
                              <div className="space-y-3">
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  {plan.start_date && (
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5" />
                                      <span>Start: {new Date(plan.start_date).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                  {plan.end_date && (
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span className={isOverdue ? "text-firm-red-500 font-bold" : ""}>
                                        {isOverdue 
                                          ? `Overdue by ${Math.abs(daysRemaining!)} days`
                                          : daysRemaining === 0
                                          ? "Due today"
                                          : `${daysRemaining} days left`
                                        }
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Progress 
                                    value={plan.progress} 
                                    className="h-3 bg-firm-black-700"
                                  />
                                  <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-3 text-xs bg-firm-black-700 text-white hover:bg-firm-black-600 border border-firm-black-600"
                                        onClick={() => handleUpdateProgress(plan.id, plan.progress - 10)}
                                        disabled={plan.progress <= 0}
                                      >
                                        <Minus className="w-3 h-3 mr-1" />
                                        10%
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-3 text-xs bg-firm-black-700 text-white hover:bg-firm-black-600 border border-firm-black-600"
                                        onClick={() => handleUpdateProgress(plan.id, plan.progress + 10)}
                                        disabled={plan.progress >= 100}
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        10%
                                      </Button>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-3 text-xs bg-firm-red-600 text-white hover:bg-firm-red-700 font-bold"
                                      onClick={() => handleUpdateProgress(plan.id, 100)}
                                      disabled={plan.progress === 100}
                                    >
                                      <Award className="w-3 h-3 mr-1" />
                                      Complete
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-20 h-20 mx-auto bg-firm-black-800 rounded-full flex items-center justify-center border-2 border-firm-black-700">
                      <Target className="w-10 h-10 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">No Study Plans Yet</h3>
                      <p className="text-gray-500">Create your first study plan to start tracking your progress</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add New Plan Card */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-firm-red-600/30 bg-gradient-to-br from-firm-red-600/5 via-firm-black-900 to-firm-black-900 sticky top-4">
              <CardHeader className="border-b border-firm-black-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-firm-red-600/20 rounded-lg">
                    <Plus className="w-5 h-5 text-firm-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-white">New Plan</CardTitle>
                    <CardDescription className="text-gray-400">Create a new study goal</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-input" className="text-sm font-bold text-gray-300">
                    Plan Title
                  </Label>
                  <Input
                    id="goal-input"
                    placeholder="e.g., Master Contract Law"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="border-2 border-firm-black-700 bg-firm-black-800 text-white placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-firm-red-600/30 focus-visible:border-firm-red-600/50"
                    disabled={isAdding}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && newGoal.trim()) {
                        e.preventDefault()
                        handleAddPlan()
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description-input" className="text-sm font-bold text-gray-300">
                    Description (Optional)
                  </Label>
                  <Input
                    id="description-input"
                    placeholder="Add details about your plan..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="border-2 border-firm-black-700 bg-firm-black-800 text-white placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-firm-red-600/30 focus-visible:border-firm-red-600/50"
                    disabled={isAdding}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && newGoal.trim()) {
                        e.preventDefault()
                        handleAddPlan()
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleAddPlan}
                  disabled={!newGoal.trim() || isAdding}
                  className="w-full bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30 h-11"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Create Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
