"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { 
  BarChart3, 
  TrendingUp, 
  Trophy, 
  Sparkles,
  Clock,
  ArrowRight,
  Target,
  AlertCircle,
  Zap,
  Award,
  FileText,
  ChevronRight,
  Activity,
  Loader2
} from "lucide-react"
import { getTestResults, getMockTests } from "@/lib/supabase/client-actions"
import { createBrowserClient } from "@/lib/supabase/client"

export default function MockTestsPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [mockTests, setMockTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("analytics")
  const [generatingTest, setGeneratingTest] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["Contract Law", "Torts"])
  const [numQuestions, setNumQuestions] = useState(10)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createBrowserClient()
        const { data: authData } = await supabase.auth.getUser()

        if (!authData?.user?.id) {
          router.push("/login")
          return
        }

        const [results, tests] = await Promise.all([
          getTestResults(authData.user.id), 
          getMockTests(authData.user.id)
        ])

        setTestResults(results || [])
        setMockTests(tests || [])
      } catch (err) {
        console.error("Error loading mock tests:", err)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleGenerateMockTest = async () => {
    if (selectedTopics.length === 0) {
      toast.error("Please select at least one topic")
      return
    }

    setGeneratingTest(true)
    setShowGenerateModal(false)
    toast.loading("Generating mock test with AI...", { id: "generating-test" })

    try {
      const supabase = createBrowserClient()
      const { data: authData } = await supabase.auth.getUser()

      if (!authData?.user?.id) return

      // Get user's case IDs for RAG context
      const { data: cases } = await supabase
        .from("cases")
        .select("id")
        .eq("user_id", authData.user.id)
        .limit(10)

      const caseIds = cases?.map(c => c.id) || []

      const response = await fetch("/api/mock-tests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authData.user.id,
          topics: selectedTopics,
          numQuestions,
          caseIds: caseIds.length > 0 ? caseIds : undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Mock test generated successfully! "${result.data.title}" with ${result.data.totalQuestions} questions.`, { id: "generating-test" })
        
        // Reload mock tests
        const tests = await getMockTests(authData.user.id)
        setMockTests(tests || [])
      } else {
        toast.error(`Error: ${result.error}`, { id: "generating-test" })
      }
    } catch (error) {
      console.error("Error generating mock test:", error)
      toast.error("Failed to generate mock test. Please try again.", { id: "generating-test" })
    } finally {
      setGeneratingTest(false)
    }
  }

  if (loading) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-full bg-gradient-to-br from-firm-black-950 via-firm-black-900 to-firm-black-950 p-6">
        <Card className="border-2 border-firm-red-600/50 bg-firm-black-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-firm-red-500" />
              <p className="text-firm-red-500 font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const avgScore = testResults.length
    ? Math.round(testResults.reduce((sum, r) => sum + (r.score || 0), 0) / testResults.length)
    : 0

  const bestScore = testResults.length > 0 
    ? Math.max(...testResults.map((r) => r.score || 0)) 
    : 0

  const chartData = testResults.map((result) => ({
    date: new Date(result.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: result.score,
  }))

  const topicPerformance =
    testResults.length > 0
      ? testResults.slice(0, 5).map((result, idx) => ({
          name: result.mock_tests?.title || `Test ${idx + 1}`,
          score: result.score,
        }))
      : []

  const getScoreColor = (score: number) => {
    if (score >= 90) return "from-firm-red-500 to-firm-red-600"
    if (score >= 80) return "from-firm-red-600 to-firm-red-700"
    if (score >= 70) return "from-firm-black-600 to-firm-black-700"
    return "from-firm-black-700 to-firm-black-800"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 80) return "Good"
    if (score >= 70) return "Fair"
    return "Needs Work"
  }

  const stats = [
    {
      label: "Average Score",
      value: `${avgScore}%`,
      description: "Across all tests",
      icon: BarChart3,
      gradient: "from-firm-red-600 to-firm-red-700",
    },
    {
      label: "Tests Completed",
      value: testResults.length,
      description: "Total attempts",
      icon: Activity,
      gradient: "from-firm-black-700 to-firm-black-800",
    },
    {
      label: "Best Score",
      value: `${bestScore}%`,
      description: "Personal best",
      icon: Trophy,
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
                <BarChart3 className="w-10 h-10 text-firm-red-500" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                  Mock Tests & <span className="text-firm-red-500">Analytics</span>
                </h1>
                <p className="text-lg text-gray-400 mt-2">
                  Practice exams and comprehensive performance tracking
                </p>
              </div>
            </div>
            
            <Badge className="bg-firm-black-800 text-gray-300 border-2 border-firm-red-600/30 px-4 py-2 text-sm font-bold">
              <Target className="w-4 h-4 mr-2 text-firm-red-500" />
              {testResults.length} {testResults.length === 1 ? "Test" : "Tests"} Completed
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-firm-black-800/50 border-2 border-firm-black-700 p-1.5">
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-firm-red-600 data-[state=active]:text-white font-bold"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
              {testResults.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-firm-black-700 text-gray-300 border-0">
                  {testResults.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="tests"
              className="data-[state=active]:bg-firm-red-600 data-[state=active]:text-white font-bold"
            >
              <Target className="w-4 h-4 mr-2" />
              Available Tests
              {mockTests.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-firm-black-700 text-gray-300 border-0">
                  {mockTests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {chartData.length > 0 ? (
              <>
                {/* Performance Over Time */}
                <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
                  <CardHeader className="border-b border-firm-black-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-firm-red-600/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-firm-red-500" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-black text-white">Performance Over Time</CardTitle>
                        <CardDescription className="text-gray-500 mt-1">Track your progress across all tests</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#737373"
                          style={{ fontSize: '12px', fill: '#A3A3A3' }}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          stroke="#737373"
                          style={{ fontSize: '12px', fill: '#A3A3A3' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1A1A1A',
                            border: '2px solid #DC2626',
                            borderRadius: '12px',
                            color: '#FFFFFF'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#DC2626"
                          strokeWidth={3}
                          dot={{ fill: "#DC2626", r: 6, strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 8, fill: "#EF4444" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Test Performance Bar Chart */}
                {topicPerformance.length > 0 && (
                  <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
                    <CardHeader className="border-b border-firm-black-700">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-firm-red-600/20 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-firm-red-500" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-black text-white">Test Performance</CardTitle>
                          <CardDescription className="text-gray-500 mt-1">Score breakdown by test</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topicPerformance}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#737373"
                            style={{ fontSize: '12px', fill: '#A3A3A3' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            stroke="#737373"
                            style={{ fontSize: '12px', fill: '#A3A3A3' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1A1A1A',
                              border: '2px solid #DC2626',
                              borderRadius: '12px',
                              color: '#FFFFFF'
                            }}
                          />
                          <Bar 
                            dataKey="score" 
                            fill="url(#colorGradient)"
                            radius={[8, 8, 0, 0]}
                          />
                          <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#DC2626" />
                              <stop offset="100%" stopColor="#EF4444" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Test Results */}
                <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
                  <CardHeader className="border-b border-firm-black-700">
                    <CardTitle className="text-2xl font-black text-white">Recent Test Results</CardTitle>
                    <CardDescription className="text-gray-500 mt-1">Your latest test attempts and scores</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {testResults.slice(0, 5).map((result) => {
                        const score = result.score || 0
                        return (
                          <div 
                            key={result.id} 
                            className="group flex items-center justify-between p-5 border-2 border-firm-black-700 rounded-xl hover:border-firm-red-600/50 hover:bg-firm-black-800 transition-all duration-300"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`p-3 rounded-lg bg-gradient-to-br ${getScoreColor(score)} shadow-lg`}>
                                <Trophy className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-white group-hover:text-firm-red-500 transition-colors">
                                  {result.mock_tests?.title || "Mock Test"}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="w-3 h-3 text-gray-500" />
                                  <p className="text-sm text-gray-500">
                                    {new Date(result.completed_at).toLocaleDateString()}
                                  </p>
                                  {result.total_questions && (
                                    <>
                                      <span className="text-gray-600">•</span>
                                      <p className="text-sm text-gray-500">
                                        {result.total_questions} questions
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-black text-firm-red-500">
                                {score}%
                              </p>
                              <Badge 
                                className={`mt-1 text-xs font-bold ${
                                  score >= 90 
                                    ? 'bg-firm-red-600 text-white border-0' 
                                    : 'bg-firm-black-700 text-gray-300 border-0'
                                }`}
                              >
                                {getScoreLabel(score)}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
                <CardContent className="pt-12 pb-12">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-firm-black-800 rounded-full flex items-center justify-center border-2 border-firm-black-700">
                      <BarChart3 className="w-10 h-10 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">No Test Results Yet</h3>
                      <p className="text-gray-500 mb-6">Start a mock test to see your performance analytics</p>
                    </div>
                    <Button 
                      className="bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30"
                      onClick={() => setActiveTab("tests")}
                    >
                      <Target className="w-5 h-5 mr-2" />
                      View Available Tests
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-6">
            {/* Generate Mock Test Section */}
            <Card className="border-2 border-firm-red-600/30 bg-gradient-to-br from-firm-red-600/5 via-firm-black-900 to-firm-black-900">
              <CardHeader className="border-b border-firm-black-700">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-firm-red-600/20 rounded-lg">
                    <Sparkles className="w-6 h-6 text-firm-red-500" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-black text-white">Generate New Mock Test</CardTitle>
                    <CardDescription className="text-gray-400">Create a comprehensive exam covering multiple legal topics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Button 
                  onClick={handleGenerateMockTest}
                  disabled={generatingTest}
                  className="w-full bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingTest ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Test...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Mock Test
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Available Tests Grid */}
            {mockTests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {mockTests.map((test) => (
                  <div key={test.id} className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-firm-red-600 to-firm-red-700 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
                    
                    <Card className="relative border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800 hover:border-firm-red-600/50 transition-all duration-300">
                      <CardHeader className="border-b border-firm-black-700 pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-2 bg-firm-red-600/20 rounded-lg group-hover:bg-firm-red-600/30 transition-colors">
                                <Target className="w-5 h-5 text-firm-red-500" />
                              </div>
                            </div>
                            <CardTitle className="text-xl font-black text-white group-hover:text-firm-red-500 transition-colors line-clamp-2">
                              {test.title}
                            </CardTitle>
                            {test.description && (
                              <CardDescription className="line-clamp-2 mt-2 text-gray-500">
                                {test.description}
                              </CardDescription>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-firm-red-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <Button 
                          className="w-full bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30 group/btn"
                        >
                          Start Test
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
                <CardContent className="pt-12 pb-12">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-firm-black-800 rounded-full flex items-center justify-center border-2 border-firm-black-700">
                      <Target className="w-10 h-10 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">No Mock Tests Available</h3>
                      <p className="text-gray-500 mb-6">Generate a new mock test to get started with practice exams</p>
                    </div>
                    <Button className="bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Your First Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
