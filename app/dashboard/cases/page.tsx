"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Upload, 
  Search,
  CheckCircle2,
  Loader2,
  Clock,
  X,
  ArrowRight,
  Sparkles,
  FolderOpen,
  Zap,
  Brain,
  BookOpen
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { getCases, createCase } from "@/lib/supabase/client-actions"
import { createBrowserClient } from "@/lib/supabase/client"
import CaseUploadCard from "@/components/case-upload-card"
import SummaryDisplayCard from "@/components/summary-display-card"

export default function CasesPage() {
  const [cases, setCases] = useState<any[]>([])
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [generatingQuiz, setGeneratingQuiz] = useState(false)
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadCases = async () => {
      try {
        const supabase = createBrowserClient()
        const { data: authData } = await supabase.auth.getUser()

        if (!authData?.user?.id) {
          router.push("/login")
          return
        }

        const casesList = await getCases(authData.user.id)
        setCases(casesList || [])
      } catch (err) {
        console.error("Error loading cases:", err)
      } finally {
        setLoading(false)
      }
    }

    loadCases()
  }, [router])

  const filteredCases = cases.filter((case_) =>
    case_.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    case_.case_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleGenerateQuiz = async (caseId: string) => {
    setGeneratingQuiz(true)
    try {
      const supabase = createBrowserClient()
      const { data: authData } = await supabase.auth.getUser()

      if (!authData?.user?.id) return

      const response = await fetch("/api/quizzes/generate-from-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          userId: authData.user.id,
          numQuestions: 5,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Quiz generated successfully! "${result.data.title}" with ${result.data.totalQuestions} questions.`)
        router.push("/dashboard/quizzes")
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error("Error generating quiz:", error)
      toast.error("Failed to generate quiz. Please try again.")
    } finally {
      setGeneratingQuiz(false)
    }
  }

  const handleGenerateFlashcards = async (caseId: string) => {
    setGeneratingFlashcards(true)
    try {
      const supabase = createBrowserClient()
      const { data: authData } = await supabase.auth.getUser()

      if (!authData?.user?.id) return

      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          userId: authData.user.id,
          numCards: 10,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Flashcards generated successfully! "${result.data.title}" with ${result.data.totalCards} cards.`)
        router.push("/dashboard/quizzes")
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error("Error generating flashcards:", error)
      toast.error("Failed to generate flashcards. Please try again.")
    } finally {
      setGeneratingFlashcards(false)
    }
  }

  const handleUpload = async (file: File, title: string) => {
    try {
      const supabase = createBrowserClient()
      const { data: authData } = await supabase.auth.getUser()

      if (!authData?.user?.id) return

      // Create case with pending status
      const newCase = await createCase(authData.user.id, {
        title,
        case_name: title,
        issue: "Analyzing...",
        rule: "Analyzing...",
        analysis: "Analyzing...",
        conclusion: "Analyzing...",
      })

      setCases([newCase, ...cases])

      // Read file content
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          // For PDF embedding
          const arrayBuffer = e.target?.result as ArrayBuffer
          const base64 = btoa(
            new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          )

          // Trigger embedding generation (fire and forget)
          fetch("/api/rag/embed-case", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              caseId: newCase.id,
              caseTitle: title,
              pdfData: base64,
              userId: authData.user.id,
            }),
          }).catch((embeddingError) => {
            console.error("Error embedding case:", embeddingError)
            // Non-critical, continue with analysis
          })

          // Also read as text for IRAC analysis
          const textReader = new FileReader()
          textReader.onload = async (textEvent) => {
            try {
              const caseText = textEvent.target?.result as string

              // Use unified LLM service (Tauri or API)
              const { unifiedLLMService } = await import("@/lib/unified-llm")
              const analysis = await unifiedLLMService.generateIRAC(caseText, {
                userId: authData.user.id,
                caseIds: [newCase.id],
              })

              // Update case with analysis
              await supabase
                .from("cases")
                .update({
                  issue: analysis.issue,
                  rule: analysis.rule,
                  analysis: analysis.analysis,
                  conclusion: analysis.conclusion,
                })
                .eq("id", newCase.id);

              // Refresh cases list
              const updatedCases = await getCases(authData.user.id);
              setCases(updatedCases || []);
            } catch (analysisError) {
              console.error("Error analyzing case:", analysisError)
              // Keep the pending analysis on error
            }
          }

          textReader.readAsText(file)
        } catch (error) {
          console.error("Error processing file:", error)
        }
      }

      reader.readAsArrayBuffer(file)
    } catch (err) {
      console.error("Error uploading case:", err)
    }
  }

  if (loading) {
    return null
  }

  const getCaseStatus = (case_: any) => {
    if (case_.issue && case_.issue !== "Analyzing...") {
      return { label: "Completed", variant: "default" as const, icon: CheckCircle2 }
    }
    return { label: "Processing", variant: "secondary" as const, icon: Loader2 }
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
                <FileText className="w-10 h-10 text-firm-red-500" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                  Case <span className="text-firm-red-500">Management</span>
                </h1>
                <p className="text-lg text-gray-400 mt-2">
                  Upload and analyze legal cases with AI-generated IRAC summaries
                </p>
              </div>
            </div>
            
            <Badge className="bg-firm-black-800 text-gray-300 border-2 border-firm-red-600/30 px-4 py-2 text-sm font-bold">
              <Sparkles className="w-4 h-4 mr-2 text-firm-red-500" />
              {cases.length} {cases.length === 1 ? "Case" : "Cases"}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Card */}
          <div className="lg:col-span-1">
            <CaseUploadCard onUpload={handleUpload} />
          </div>

          {/* Cases List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                type="search"
                placeholder="Search cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-firm-black-800 border-2 border-firm-black-700 text-white placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-firm-red-600/30 focus-visible:border-firm-red-600/50"
              />
            </div>

            {/* Cases Grid */}
            <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
              <CardHeader className="border-b border-firm-black-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-firm-red-600/20 rounded-lg">
                    <FolderOpen className="w-5 h-5 text-firm-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-white">Your Cases</CardTitle>
                    <CardDescription className="text-gray-500 mt-1">
                      {filteredCases.length} {filteredCases.length === 1 ? "case" : "cases"} found
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {filteredCases.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCases.map((case_) => {
                      const status = getCaseStatus(case_)
                      const StatusIcon = status.icon
                      const isSelected = selectedCase?.id === case_.id

                      return (
                        <div
                          key={case_.id}
                          className={`group relative overflow-hidden border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 h-full flex flex-col ${
                            isSelected
                              ? "border-firm-red-600 bg-firm-red-600/10 shadow-lg shadow-firm-red-600/20 scale-[1.02]"
                              : "border-firm-black-700 bg-firm-black-800/50 hover:border-firm-red-600/50 hover:bg-firm-black-800"
                          }`}
                          onClick={() => setSelectedCase(isSelected ? null : case_)}
                        >
                          {/* Glow effect */}
                          {isSelected && (
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-firm-red-600 to-firm-red-700 rounded-xl opacity-20 blur" />
                          )}
                          
                          <div className="relative flex items-start justify-between gap-4 flex-1">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className={`p-3 rounded-lg flex-shrink-0 ${
                                status.label === "Completed"
                                  ? "bg-gradient-to-br from-firm-red-600 to-firm-red-700 shadow-lg shadow-firm-red-600/30"
                                  : "bg-gradient-to-br from-firm-black-700 to-firm-black-800 border-2 border-firm-red-600/30"
                              }`}>
                                <StatusIcon className={`w-5 h-5 text-white ${status.label === "Processing" ? "animate-spin" : ""}`} />
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col">
                                <h3 className="font-bold text-lg mb-2 line-clamp-2 text-white group-hover:text-firm-red-500 transition-colors">
                                  {case_.title || case_.case_name || "Untitled Case"}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span className="truncate">{new Date(case_.created_at).toLocaleDateString()}</span>
                                </div>
                                <Badge 
                                  className={`text-xs font-bold w-fit ${
                                    status.label === "Completed"
                                      ? "bg-firm-red-600 text-white border-0"
                                      : "bg-firm-black-700 text-gray-300 border-0"
                                  }`}
                                >
                                  {status.label}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`shrink-0 hover:bg-firm-black-700 flex-shrink-0 ${isSelected ? "text-firm-red-500" : "text-gray-600"}`}
                            >
                              {isSelected ? (
                                <X className="w-5 h-5" />
                              ) : (
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    {searchQuery ? (
                      <>
                        <div className="w-20 h-20 mx-auto bg-firm-black-800 rounded-full flex items-center justify-center border-2 border-firm-black-700">
                          <Search className="w-10 h-10 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">No Cases Found</h3>
                          <p className="text-gray-500">Try adjusting your search query</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setSearchQuery("")}
                          className="border-firm-black-700 bg-firm-black-800 text-white hover:bg-firm-black-700"
                        >
                          Clear Search
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 mx-auto bg-firm-black-800 rounded-full flex items-center justify-center border-2 border-firm-black-700">
                          <FileText className="w-10 h-10 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">No Cases Yet</h3>
                          <p className="text-gray-500">Upload your first case to get started with AI-powered analysis</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* IRAC Summary Display */}
        {selectedCase && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <SummaryDisplayCard
              summary={{
                issue: selectedCase.issue,
                rule: selectedCase.rule,
                analysis: selectedCase.analysis,
                conclusion: selectedCase.conclusion,
              }}
              caseTitle={selectedCase.title || selectedCase.case_name || "Untitled Case"}
              onClose={() => setSelectedCase(null)}
            />
            
            {/* AI Generation Actions */}
            {selectedCase.issue !== "Analyzing..." && (
              <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
                <CardHeader className="pb-4 border-b border-firm-black-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-firm-red-600/20 rounded-lg">
                      <Sparkles className="w-5 h-5 text-firm-red-500" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black text-white">AI Learning Tools</CardTitle>
                      <CardDescription className="text-gray-500 mt-1">
                        Generate study materials from this case
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Generate Quiz */}
                    <button
                      onClick={() => handleGenerateQuiz(selectedCase.id)}
                      disabled={generatingQuiz}
                      className="group relative p-6 rounded-xl border-2 border-firm-black-700 bg-firm-black-800/50 hover:border-firm-red-600/50 hover:bg-firm-black-800 transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-firm-red-600/20 rounded-lg group-hover:bg-firm-red-600/30 transition-colors flex-shrink-0">
                          {generatingQuiz ? (
                            <Loader2 className="w-6 h-6 text-firm-red-500 animate-spin" />
                          ) : (
                            <Brain className="w-6 h-6 text-firm-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white group-hover:text-firm-red-500 transition-colors mb-2">
                            {generatingQuiz ? "Generating Quiz..." : "Generate Quiz"}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Create 5 multiple-choice questions from this case analysis
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-firm-red-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </button>

                    {/* Generate Flashcards */}
                    <button
                      onClick={() => handleGenerateFlashcards(selectedCase.id)}
                      disabled={generatingFlashcards}
                      className="group relative p-6 rounded-xl border-2 border-firm-black-700 bg-firm-black-800/50 hover:border-firm-red-600/50 hover:bg-firm-black-800 transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-firm-red-600/20 rounded-lg group-hover:bg-firm-red-600/30 transition-colors flex-shrink-0">
                          {generatingFlashcards ? (
                            <Loader2 className="w-6 h-6 text-firm-red-500 animate-spin" />
                          ) : (
                            <BookOpen className="w-6 h-6 text-firm-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white group-hover:text-firm-red-500 transition-colors mb-2">
                            {generatingFlashcards ? "Generating Flashcards..." : "Generate Flashcards"}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Create 10 flashcards for quick review and memorization
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-firm-red-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
