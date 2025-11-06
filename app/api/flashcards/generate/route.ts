import { type NextRequest, NextResponse } from "next/server"
import { llmService } from "@/lib/llm"
import { createServerClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"

/**
 * POST /api/flashcards/generate
 * Generate flashcards from a case using AI
 */
export async function POST(request: NextRequest) {
  try {
    const { caseId, userId, numCards = 10 } = await request.json()

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

    // Prepare case content for AI
    const caseContent = `
Title: ${caseData.title || caseData.case_name}

Issue: ${caseData.issue}
Rule: ${caseData.rule}
Analysis: ${caseData.analysis}
Conclusion: ${caseData.conclusion}
    `.trim()

    // Generate quiz questions (we'll convert these to flashcards)
    const questions = await llmService.generateQuizQuestions(
      caseContent,
      numCards,
      {
        userId,
        caseIds: [caseId],
        includeContext: true,
      }
    )

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate flashcards" },
        { status: 500 }
      )
    }

    // Create flashcard set
    const setId = randomUUID()
    const { error: setError } = await supabase
      .from("flashcard_sets")
      .insert({
        id: setId,
        user_id: userId,
        title: `${caseData.title || caseData.case_name} - Flashcards`,
        description: `Auto-generated flashcards from case analysis`,
        total_cards: questions.length,
      })

    if (setError) {
      console.error("Error creating flashcard set:", setError)
      return NextResponse.json(
        { error: "Failed to create flashcard set" },
        { status: 500 }
      )
    }

    // Convert questions to flashcards (question + all options as front, correct answer + explanation as back)
    const flashcards = questions.map((q) => {
      const optionsText = q.options
        .map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`)
        .join("\n")
      
      const correctLetter = String.fromCharCode(65 + q.correct_answer)
      const correctAnswer = q.options[q.correct_answer]

      return {
        id: randomUUID(),
        set_id: setId,
        front: `${q.question}\n\n${optionsText}`,
        back: `✅ Correct Answer: ${correctLetter}. ${correctAnswer}\n\n${q.explanation}`,
      }
    })

    // Insert flashcards in batches
    const batchSize = 50
    for (let i = 0; i < flashcards.length; i += batchSize) {
      const batch = flashcards.slice(i, i + batchSize)
      const { error: cardsError } = await supabase
        .from("flashcards")
        .insert(batch)

      if (cardsError) {
        console.error("Error inserting flashcards batch:", cardsError)
        // Continue with other batches
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        setId,
        title: `${caseData.title || caseData.case_name} - Flashcards`,
        totalCards: flashcards.length,
      },
    })
  } catch (error: any) {
    console.error("Error generating flashcards:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate flashcards",
      },
      { status: 500 }
    )
  }
}

