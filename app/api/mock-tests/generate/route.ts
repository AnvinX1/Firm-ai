import { type NextRequest, NextResponse } from "next/server"
import { llmService } from "@/lib/llm"
import { createServerClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"

/**
 * POST /api/mock-tests/generate
 * Generate a comprehensive mock test from topics/cases
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, topics, numQuestions = 10, caseIds } = await request.json()

    if (!userId || !topics || topics.length === 0) {
      return NextResponse.json(
        { error: "User ID and topics are required" },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // If caseIds provided, get case titles to enhance topics
    let enhancedTopics = [...topics]
    if (caseIds && caseIds.length > 0) {
      const { data: cases } = await supabase
        .from("cases")
        .select("title, case_name, issue")
        .in("id", caseIds)
        .eq("user_id", userId)

      if (cases && cases.length > 0) {
        enhancedTopics = [
          ...topics,
          ...cases.map(c => `${c.title || c.case_name}: ${c.issue}`)
        ]
      }
    }

    // Generate mock test using AI with RAG context
    const mockTestData = await llmService.generateMockTest(
      enhancedTopics,
      numQuestions,
      {
        userId,
        includeContext: true,
      }
    )

    if (!mockTestData || !mockTestData.questions || mockTestData.questions.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate mock test questions" },
        { status: 500 }
      )
    }

    // Create mock test in database
    const testId = randomUUID()
    const { error: testError } = await supabase
      .from("mock_tests")
      .insert({
        id: testId,
        user_id: userId,
        title: mockTestData.title || `Mock Test - ${new Date().toLocaleDateString()}`,
        description: `Comprehensive test covering: ${topics.slice(0, 3).join(", ")}${topics.length > 3 ? "..." : ""}`,
        total_questions: mockTestData.questions.length,
        duration_minutes: mockTestData.questions.length * 2, // 2 minutes per question
        passing_score: 70,
      })

    if (testError) {
      console.error("Error creating mock test:", testError)
      return NextResponse.json(
        { error: "Failed to create mock test" },
        { status: 500 }
      )
    }

    // Insert test questions in batches
    const questions = mockTestData.questions.map((q, index) => ({
      id: randomUUID(),
      test_id: testId,
      question_number: index + 1,
      question_text: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      topic: q.topic || topics[0] || "General",
      points: 1,
    }))

    const batchSize = 50
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize)
      const { error: questionsError } = await supabase
        .from("test_questions")
        .insert(batch)

      if (questionsError) {
        console.error("Error inserting questions batch:", questionsError)
        // Continue with other batches
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        testId,
        title: mockTestData.title,
        totalQuestions: questions.length,
        durationMinutes: mockTestData.questions.length * 2,
      },
    })
  } catch (error: any) {
    console.error("Error generating mock test:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate mock test",
      },
      { status: 500 }
    )
  }
}

