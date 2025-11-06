"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Clock, Award, ChevronRight, Zap } from "lucide-react"
import Link from "next/link"

interface QuizCardProps {
  quiz: {
    id: string
    title: string
    description?: string
    question_count?: number
    created_at?: string
    score?: number
  }
}

export default function QuizCard({ quiz }: QuizCardProps) {
  const questionCount = quiz.question_count || 10
  const hasScore = quiz.score !== undefined

  return (
    <div className="group relative">
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-firm-red-600 to-firm-red-700 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
      
      <Card className="relative border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800 hover:border-firm-red-600/50 transition-all duration-300 overflow-hidden">
        {/* Header */}
        <CardHeader className="border-b border-firm-black-700 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-firm-red-600/20 rounded-lg group-hover:bg-firm-red-600/30 transition-colors">
                  <Brain className="w-5 h-5 text-firm-red-500" />
                </div>
                {hasScore && (
                  <Badge className="bg-firm-red-600 text-white border-0 font-bold shadow-lg shadow-firm-red-600/30">
                    <Award className="w-3 h-3 mr-1" />
                    {quiz.score}%
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl font-black text-white group-hover:text-firm-red-500 transition-colors line-clamp-2">
                {quiz.title}
              </CardTitle>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-firm-red-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="pt-6 space-y-4">
          {quiz.description && (
            <CardDescription className="text-gray-400 line-clamp-2">
              {quiz.description}
            </CardDescription>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Zap className="w-4 h-4 text-firm-red-500" />
              <span className="font-medium">{questionCount} questions</span>
            </div>
            {quiz.created_at && (
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{new Date(quiz.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Link href={`/dashboard/quizzes/${quiz.id}`} className="block">
            <Button 
              className="w-full bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30 group/button"
            >
              <span>{hasScore ? "Review Quiz" : "Start Quiz"}</span>
              <ChevronRight className="w-4 h-4 ml-2 group-hover/button:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardContent>

        {/* Score Badge - Absolute */}
        {hasScore && (
          <div className="absolute top-4 right-4">
            <div className="w-12 h-12 bg-firm-red-600 rounded-full flex items-center justify-center border-2 border-firm-red-500 shadow-lg shadow-firm-red-600/50">
              <span className="text-white font-black text-sm">{quiz.score}%</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
