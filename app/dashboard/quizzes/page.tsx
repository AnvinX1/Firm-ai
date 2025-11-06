"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  BookOpen, 
  Sparkles, 
  Plus,
  Clock,
  TrendingUp,
  FileText,
  Zap,
  Target,
  Award,
  RotateCcw,
  ChevronRight,
  Flame
} from "lucide-react"
import { getFlashcardSets, getFlashcardsInSet, getQuizzes, getCases } from "@/lib/supabase/client-actions"
import { createBrowserClient } from "@/lib/supabase/client"
import FlashcardSet from "@/components/flashcard-set"
import QuizCard from "@/components/quiz-card"
import Link from "next/link"

export default function QuizzesPage() {
  const [flashcardSets, setFlashcardSets] = useState<any[]>([])
  const [currentSet, setCurrentSet] = useState<any>(null)
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [flipped, setFlipped] = useState<number | null>(null)
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

        const [sets, quizzesList, casesList] = await Promise.all([
          getFlashcardSets(authData.user.id),
          getQuizzes(authData.user.id),
          getCases(authData.user.id),
        ])

        setFlashcardSets(sets || [])
        setQuizzes(quizzesList || [])
        setCases(casesList || [])

        if (sets && sets.length > 0) {
          setCurrentSet(sets[0])
          const cards = await getFlashcardsInSet(sets[0].id)
          setFlashcards(cards || [])
        }
      } catch (err) {
        console.error("Error loading quizzes:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleSetChange = async (setId: string) => {
    const set = flashcardSets.find((s) => s.id === setId)
    setCurrentSet(set)
    const cards = await getFlashcardsInSet(setId)
    setFlashcards(cards || [])
    setFlipped(null)
  }

  const stats = [
    {
      label: "Total Cards",
      value: flashcards.length,
      icon: BookOpen,
      gradient: "from-firm-red-600 to-firm-red-700",
    },
    {
      label: "Completed",
      value: Math.floor(flashcards.length * 0.6),
      icon: Award,
      gradient: "from-firm-black-700 to-firm-black-800",
    },
    {
      label: "Accuracy",
      value: "87%",
      icon: Target,
      gradient: "from-firm-red-500 to-firm-red-600",
    },
    {
      label: "Streak",
      value: "5 days",
      icon: Flame,
      gradient: "from-firm-black-600 to-firm-black-700",
    },
  ]

  if (loading) {
    return null
  }

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
                <Brain className="w-10 h-10 text-firm-red-500" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                  Quizzes & <span className="text-firm-red-500">Flashcards</span>
                </h1>
                <p className="text-lg text-gray-400 mt-2">
                  Master legal concepts through interactive learning
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                size="lg"
                className="bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Set
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="group relative h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-firm-red-600 to-firm-red-700 rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-500" />
                
                <Card className="relative h-full border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800 hover:border-firm-red-600/50 transition-all duration-300">
                  <CardContent className="pt-6 h-full">
                    <div className="flex items-start justify-between h-full">
                      <div className="space-y-2 flex-1">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide line-clamp-1">{stat.label}</p>
                        <p className="text-4xl font-black text-white">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-xl flex-shrink-0`}>
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
        <Tabs defaultValue="flashcards" className="space-y-6">
          <TabsList className="bg-firm-black-800/50 border-2 border-firm-black-700 p-1.5">
            <TabsTrigger 
              value="flashcards" 
              className="data-[state=active]:bg-firm-red-600 data-[state=active]:text-white font-bold"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Flashcards
            </TabsTrigger>
            <TabsTrigger 
              value="quizzes"
              className="data-[state=active]:bg-firm-red-600 data-[state=active]:text-white font-bold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Quizzes
            </TabsTrigger>
            <TabsTrigger 
              value="cases"
              className="data-[state=active]:bg-firm-red-600 data-[state=active]:text-white font-bold"
            >
              <FileText className="w-4 h-4 mr-2" />
              Case Quizzes
            </TabsTrigger>
          </TabsList>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards" className="space-y-6">
            {flashcardSets.length > 0 ? (
              <>
                {/* Set Selector */}
                <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
                  <CardHeader className="border-b border-firm-black-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-firm-red-600/20 rounded-lg">
                          <BookOpen className="w-5 h-5 text-firm-red-500" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-black text-white">Select Study Set</CardTitle>
                          <CardDescription className="text-gray-500">Choose a flashcard collection</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {flashcardSets.map((set) => (
                        <button
                          key={set.id}
                          onClick={() => handleSetChange(set.id)}
                          className={`
                            p-4 rounded-xl border-2 text-left transition-all duration-300 h-full flex flex-col
                            ${currentSet?.id === set.id 
                              ? 'border-firm-red-600 bg-firm-red-600/10' 
                              : 'border-firm-black-700 bg-firm-black-800/50 hover:border-firm-red-600/50'
                            }
                          `}
                        >
                          <div className="flex items-start justify-between mb-2 flex-shrink-0">
                            <h3 className="font-bold text-white line-clamp-1 flex-1">{set.title}</h3>
                            {currentSet?.id === set.id && (
                              <div className="w-3 h-3 bg-firm-red-600 rounded-full flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2 flex-1">{set.description || "No description"}</p>
                          <div className="flex items-center gap-2 mt-3 flex-shrink-0">
                            <Badge className="bg-firm-black-700 text-gray-300 border-0">
                              {flashcards.length} cards
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Flashcards Display */}
                {currentSet && flashcards.length > 0 && (
                  <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
                    <CardHeader className="border-b border-firm-black-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-firm-red-600/20 rounded-lg">
                            <Zap className="w-5 h-5 text-firm-red-500" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-black text-white">{currentSet.title}</CardTitle>
                            <CardDescription className="text-gray-500 mt-1">
                              {flashcards.length} flashcards
                            </CardDescription>
                          </div>
                        </div>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setFlipped(null)}
                          className="border-firm-red-600/50 text-firm-red-500 hover:bg-firm-red-600/10"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <FlashcardSet 
                        flashcards={flashcards} 
                        flipped={flipped}
                        setFlipped={setFlipped}
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
                <CardContent className="pt-12 pb-12">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-firm-black-800 rounded-full flex items-center justify-center border-2 border-firm-black-700">
                      <BookOpen className="w-10 h-10 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">No Flashcard Sets</h3>
                      <p className="text-gray-500 mb-6">Create your first set to start learning</p>
                    </div>
                    <Button className="bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30">
                      <Plus className="w-5 h-5 mr-2" />
                      Create Your First Set
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            {quizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            ) : (
              <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
                <CardContent className="pt-12 pb-12">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-firm-black-800 rounded-full flex items-center justify-center border-2 border-firm-black-700">
                      <Sparkles className="w-10 h-10 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">No AI Quizzes Yet</h3>
                      <p className="text-gray-500 mb-6">Generate quizzes from your case analyses</p>
                    </div>
                    <Link href="/dashboard/cases">
                      <Button className="bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30">
                        <Zap className="w-5 h-5 mr-2" />
                        Analyze a Case First
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Case Quizzes Tab */}
          <TabsContent value="cases" className="space-y-6">
            <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
              <CardHeader className="border-b border-firm-black-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-firm-red-600/20 rounded-lg">
                    <FileText className="w-5 h-5 text-firm-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-white">Generate from Cases</CardTitle>
                    <CardDescription className="text-gray-500 mt-1">
                      Create quizzes from your analyzed legal cases
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {cases.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cases.slice(0, 6).map((case_) => (
                      <Link 
                        key={case_.id}
                        href={`/dashboard/cases?generate=${case_.id}`}
                        className="group h-full block"
                      >
                        <div className="p-5 rounded-xl border-2 border-firm-black-700 bg-firm-black-800/50 hover:border-firm-red-600/50 hover:bg-firm-black-800 transition-all duration-300 h-full flex flex-col">
                          <div className="flex items-start justify-between mb-3 flex-shrink-0">
                            <div className="p-2 bg-firm-red-600/20 rounded-lg group-hover:bg-firm-red-600/30 transition-colors flex-shrink-0">
                              <FileText className="w-5 h-5 text-firm-red-500" />
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-firm-red-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </div>
                          <h3 className="font-bold text-white mb-2 group-hover:text-firm-red-500 transition-colors line-clamp-2 flex-1">
                            {case_.title || "Untitled Case"}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(case_.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-firm-black-800 rounded-full flex items-center justify-center border-2 border-firm-black-700">
                      <FileText className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Cases Available</h3>
                    <p className="text-gray-500 mb-6">Analyze legal cases to generate quizzes</p>
                    <Link href="/dashboard/cases">
                      <Button className="bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30">
                        <Zap className="w-5 h-5 mr-2" />
                        Analyze Your First Case
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
