import { type NextRequest, NextResponse } from "next/server"
import { llmService } from "@/lib/llm"

/**
 * POST /api/tutor
 * Handles AI tutor conversations
 */
export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Get AI tutor response
    const response = await llmService.tutorChat(message, context || {})

    return NextResponse.json({
      success: true,
      data: {
        message: response,
      },
    })
  } catch (error: any) {
    console.error("Error getting tutor response:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get tutor response",
      },
      { status: 500 }
    )
  }
}

