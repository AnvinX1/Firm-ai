import { type NextRequest, NextResponse } from "next/server"
import { documentProcessor } from "@/lib/document-processor"
import { createServerClient } from "@/lib/supabase/server"

/**
 * POST /api/rag/embed-case
 * Process uploaded case and generate embeddings
 */
export async function POST(request: NextRequest) {
  try {
    const { caseId, caseTitle, pdfData, userId } = await request.json()

    if (!caseId || !caseTitle || !pdfData || !userId) {
      return NextResponse.json(
        { error: "Case ID, title, PDF data, and user ID are required" },
        { status: 400 }
      )
    }

    // Convert base64 to buffer if needed
    let pdfBuffer: Buffer
    if (typeof pdfData === "string") {
      pdfBuffer = Buffer.from(pdfData, "base64")
    } else {
      pdfBuffer = Buffer.from(pdfData)
    }

    // Create or get document entry
    const supabase = await createServerClient()
    let documentId: string
    
    const { data: existingDoc } = await supabase
      .from("documents")
      .select("id")
      .eq("case_id", caseId)
      .single()

    if (existingDoc) {
      documentId = existingDoc.id
    } else {
      // Create new document entry
      const { data: newDoc, error: insertError } = await supabase
        .from("documents")
        .insert({
          case_id: caseId,
          user_id: userId,
          document_type: "user_case",
          title: caseTitle,
          embedding_status: "processing",
        })
        .select("id")
        .single()
      
      if (insertError || !newDoc) {
        throw new Error("Failed to create document entry")
      }
      documentId = newDoc.id
    }

    // Process and embed the document (chunks will reference documentId)
    const result = await documentProcessor.processAndEmbed(
      pdfBuffer,
      {
        user_id: userId,
        case_id: caseId,
        title: caseTitle,
        document_type: "user_case",
        document_id: documentId, // Pass the document ID
      },
      "user-cases"
    )

    // Update document status
    await supabase
      .from("documents")
      .update({
        embedding_status: "completed",
        total_chunks: result.totalChunks,
      })
      .eq("id", documentId)

    return NextResponse.json({
      success: true,
      data: {
        caseId,
        totalChunks: result.totalChunks,
        status: "completed",
      },
    })
  } catch (error: any) {
    console.error("Error embedding case:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to embed case",
      },
      { status: 500 }
    )
  }
}

