import { type NextRequest, NextResponse } from "next/server"
import { ragService } from "@/lib/rag"

/**
 * POST /api/rag/search
 * Semantic search across documents
 */
export async function POST(request: NextRequest) {
  try {
    const { query, userId, caseIds, includeKnowledgeBase, limit } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      )
    }

    // Search for relevant chunks
    const results = await ragService.search(query, {
      collectionName: "user-cases",
      limit: limit || 5,
      userId,
      caseIds,
      includeKnowledgeBase: includeKnowledgeBase !== false, // Default to true
      minDistance: 0.7,
    })

    // Format results
    const formattedResults = results.map((result) => ({
      chunk_id: result.chunk.id,
      text: result.chunk.text,
      metadata: result.chunk.metadata,
      similarity: 1 - result.distance, // Convert distance to similarity
    }))

    return NextResponse.json({
      success: true,
      data: {
        results: formattedResults,
        count: formattedResults.length,
      },
    })
  } catch (error: any) {
    console.error("Error searching RAG:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to search documents",
      },
      { status: 500 }
    )
  }
}

