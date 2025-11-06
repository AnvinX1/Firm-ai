import { type NextRequest, NextResponse } from "next/server"
import { llmService } from "@/lib/llm"

/**
 * POST /api/analyze-case
 * Analyzes a legal case and generates IRAC summary
 */
export async function POST(request: NextRequest) {
  try {
    const { caseText, caseTitle } = await request.json()

    if (!caseText || !caseTitle) {
      return NextResponse.json(
        { error: "Case text and title are required" },
        { status: 400 }
      )
    }

    // Generate IRAC analysis
    const analysis = await llmService.generateIRAC(caseText)

    return NextResponse.json({
      success: true,
      data: {
        title: caseTitle,
        ...analysis,
      },
    })
  } catch (error: any) {
    console.error("Error analyzing case:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to analyze case",
      },
      { status: 500 }
    )
  }
}

