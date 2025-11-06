import { type NextRequest, NextResponse } from "next/server"
import { llmService } from "@/lib/llm"
import { createServerClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"

/**
 * POST /api/quizzes/generate-from-case
 * Generate a quiz from a specific case using AI + RAG
 */
export async function POST(request: NextRequest) {
  try {
    const { caseId, userId, numQuestions = 5 } = await request.json()

    if (!caseId || !userId) {
      return NextResponse.json(
        { error: "Case ID and user ID are required" },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Get case content
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .eq("user_id", userId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      )
    }

    // Prepare comprehensive case content for AI
    const caseContent = `
Title: ${caseData.title || caseData.case_name}

IRAC Analysis:

Issue: ${caseData.issue}

Rule: ${caseData.rule}

Analysis: ${caseData.analysis}

Conclusion: ${caseData.conclusion}
    `.trim()

    // Generate quiz questions with RAG context
    const questions = await llmService.generateQuizQuestions(
      caseContent,
      numQuestions,
      {
        userId,
        caseIds: [caseId],
        includeContext: true, // This will search for related legal context
      }
    )

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate quiz questions" },
        { status: 500 }
      )
    }

    // Create quiz in database
    const quizId = randomUUID()
    const { error: quizError } = await supabase
      .from("quizzes")
      .insert({
        id: quizId,
        user_id: userId,
        case_id: caseId,
        title: `Quiz: ${caseData.title || caseData.case_name}`,
        description: `Test your understanding of this case analysis`,
        total_questions: questions.length,
      })

    if (quizError) {
      console.error("Error creating quiz:", quizError)
      return NextResponse.json(
        { error: "Failed to create quiz" },
        { status: 500 }
      )
    }

    // Insert quiz questions in batches
    const quizQuestions = questions.map((q, index) => ({
      id: randomUUID(),
      quiz_id: quizId,
      question_number: index + 1,
      question_text: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
    }))

    const batchSize = 50
    for (let i = 0; i < quizQuestions.length; i += batchSize) {
      const batch = quizQuestions.slice(i, i + batchSize)
      const { error: questionsError } = await supabase
        .from("quiz_questions")
        .insert(batch)

      if (questionsError) {
        console.error("Error inserting quiz questions batch:", questionsError)
        // Continue with other batches
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        quizId,
        caseId,
        title: `Quiz: ${caseData.title || caseData.case_name}`,
        totalQuestions: questions.length,
      },
    })
  } catch (error: any) {
    console.error("Error generating quiz from case:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate quiz",
      },
      { status: 500 }
    )
  }
}

