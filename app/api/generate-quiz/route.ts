import { type NextRequest, NextResponse } from "next/server"
import { llmService } from "@/lib/llm"

/**
 * POST /api/generate-quiz
 * Generates quiz questions from case content
 */
export async function POST(request: NextRequest) {
  try {
    const { caseContent, numQuestions } = await request.json()

    if (!caseContent) {
      return NextResponse.json(
        { error: "Case content is required" },
        { status: 400 }
      )
    }

    const questions = await llmService.generateQuizQuestions(
      caseContent,
      numQuestions || 5
    )

    return NextResponse.json({
      success: true,
      data: {
        questions,
      },
    })
  } catch (error: any) {
    console.error("Error generating quiz:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate quiz",
      },
      { status: 500 }
    )
  }
}

