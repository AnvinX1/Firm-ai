/**
 * OpenRouter LLM Integration
 * Provides AI services for FIRM AI platform
 */

import { ragService } from "./rag"

interface OpenRouterMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface OpenRouterRequest {
  model: string
  messages: OpenRouterMessage[]
  temperature?: number
  max_tokens?: number
}

interface OpenRouterResponse {
  id: string
  model: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

class LLMService {
  private apiKey: string
  private baseUrl = "https://openrouter.ai/api/v1"
  private defaultModel = "google/gemini-2.0-flash-exp"

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || ""
    if (!this.apiKey) {
      console.warn("OpenRouter API key not found. AI features will be limited.")
    }
  }

  async chat(
    messages: OpenRouterMessage[],
    options: {
      model?: string
      temperature?: number
      max_tokens?: number
    } = {}
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is not configured")
    }

    const request: OpenRouterRequest = {
      model: options.model || this.defaultModel,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 4000,
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://firmai.com",
          "X-Title": "FIRM AI",
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("OpenRouter API error response:", errorText)
        throw new Error(`OpenRouter API error (${response.status}): ${errorText}`)
      }

      const data: OpenRouterResponse = await response.json()
      
      if (!data.choices || data.choices.length === 0) {
        console.error("OpenRouter API: No choices in response", data)
        throw new Error("No response from AI model")
      }
      
      return data.choices[0]?.message?.content || ""
    } catch (error) {
      console.error("OpenRouter API error:", error)
      throw error
    }
  }

  /**
   * Generate IRAC analysis from legal case text
   */
  async generateIRAC(
    caseText: string,
    options: {
      userId?: string
      caseIds?: string[]
      includeContext?: boolean
    } = {}
  ): Promise<{
    issue: string
    rule: string
    analysis: string
    conclusion: string
  }> {
    const { userId, caseIds, includeContext = true } = options

    const systemPrompt = `You are an expert legal AI assistant specializing in IRAC (Issue, Rule, Analysis, Conclusion) case analysis. 
Your task is to analyze legal cases and provide comprehensive IRAC summaries that help law students understand the key legal concepts.

Guidelines:
- Extract the central legal issue clearly and concisely
- Identify the applicable legal rule(s) or principle(s)
- Provide thorough analysis connecting facts to the rule
- State a clear conclusion based on your analysis
- Use professional legal terminology
- Be precise and structured in your responses
- If provided with relevant legal context, use it to enhance your analysis
- Format your response as JSON with keys: issue, rule, analysis, conclusion`

    // Search for relevant context if enabled
    let contextInfo = ""
    if (includeContext) {
      try {
        const searchQuery = caseText.substring(0, 500) // Use first 500 chars as search query
        const results = await ragService.search(searchQuery, {
          limit: 5,
          userId,
          caseIds,
          includeKnowledgeBase: true,
        })

        if (results.length > 0) {
          contextInfo = "\n\nRelevant Legal Context:\n" + ragService.formatContextForLLM(results)
        }
      } catch (error) {
        console.error("Error retrieving RAG context:", error)
        // Continue without context if search fails
      }
    }

    const userPrompt = `Please analyze the following legal case and provide an IRAC summary:

${caseText}${contextInfo}

Provide your response as a JSON object with the following structure:
{
  "issue": "The central legal issue",
  "rule": "The applicable legal rule or principle",
  "analysis": "How the rule applies to the facts",
  "conclusion": "The logical conclusion based on the analysis"
}`

    const messages: OpenRouterMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]

    const response = await this.chat(messages, {
      temperature: 0.3, // Lower temperature for more consistent legal analysis
      max_tokens: 2000,
    })

    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = response.match(/```json\n([\s\S]*?)```/) || response.match(/```\n([\s\S]*?)```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : response
      
      const parsed = JSON.parse(jsonStr.trim())
      return {
        issue: parsed.issue || "Issue analysis pending",
        rule: parsed.rule || "Rule analysis pending",
        analysis: parsed.analysis || "Analysis pending",
        conclusion: parsed.conclusion || "Conclusion pending",
      }
    } catch (error) {
      console.error("Failed to parse IRAC JSON:", error)
      // Fallback if JSON parsing fails
      return {
        issue: response.split("\n")[0] || "Issue analysis pending",
        rule: response.split("\n").slice(1, 2).join(" ") || "Rule analysis pending",
        analysis: response.split("\n").slice(2, -1).join(" ") || "Analysis pending",
        conclusion: response.split("\n").slice(-1)[0] || "Conclusion pending",
      }
    }
  }

  /**
   * Generate quiz questions from case content
   */
  async generateQuizQuestions(
    caseContent: string,
    numQuestions: number = 5,
    options: {
      userId?: string
      caseIds?: string[]
      includeContext?: boolean
    } = {}
  ): Promise<
    Array<{
      question: string
      options: string[]
      correct_answer: number
      explanation: string
    }>
  > {
    const { userId, caseIds, includeContext = true } = options

    const systemPrompt = `You are an expert legal AI assistant specializing in creating educational quiz questions for law students.
Your task is to create high-quality, pedagogically sound quiz questions based on legal case content.

Guidelines:
- Create questions that test understanding of key legal concepts
- Provide 4 multiple-choice options (A, B, C, D)
- Ensure only one correct answer
- Include explanations that help students learn
- Vary question difficulty
- Use clear, unambiguous language
- Use related legal context to create comprehensive questions
- Format responses as JSON array`

    // Search for relevant context if enabled
    let contextInfo = ""
    if (includeContext) {
      try {
        const searchQuery = caseContent.substring(0, 500)
        const results = await ragService.search(searchQuery, {
          limit: 3,
          userId,
          caseIds,
          includeKnowledgeBase: true,
        })

        if (results.length > 0) {
          contextInfo = "\n\nRelated Legal Context:\n" + ragService.formatContextForLLM(results)
        }
      } catch (error) {
        console.error("Error retrieving RAG context for quiz:", error)
      }
    }

    const userPrompt = `Based on the following legal case, generate ${numQuestions} multiple-choice quiz questions:

${caseContent}${contextInfo}

Provide your response as a JSON array with the following structure:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Why this answer is correct"
  }
]`

    const messages: OpenRouterMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]

    const response = await this.chat(messages, {
      temperature: 0.5,
      max_tokens: 3000,
    })

    try {
      const jsonMatch = response.match(/```json\n([\s\S]*?)```/) || response.match(/```\n([\s\S]*?)```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : response
      
      const parsed = JSON.parse(jsonStr.trim())
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error("Failed to parse quiz JSON:", error)
      return []
    }
  }

  /**
   * Chat with AI tutor
   */
  async tutorChat(
    userMessage: string,
    context: {
      caseHistory?: Array<{ title: string; summary: string }>
      studyTopic?: string
      userId?: string
      includeContext?: boolean
    } = {}
  ): Promise<string> {
    const { userId, includeContext = true } = context

    const systemPrompt = `You are an expert legal AI tutor helping law students understand complex legal concepts.
Your role is to explain legal principles clearly, answer questions, and provide guidance.

Guidelines:
- Be conversational and supportive
- Explain legal concepts in accessible language
- Use examples when helpful
- Encourage critical thinking
- Correct misconceptions gently
- Provide accurate legal information
- If asked about specific cases, provide analysis based on standard legal principles
- Use relevant legal context from the student's case library to provide personalized examples
- Keep responses concise but thorough
- Ask clarifying questions when needed`

    let contextPrompt = userMessage

    if (context.caseHistory && context.caseHistory.length > 0) {
      contextPrompt += `\n\nContext: The student has been studying the following cases:\n${context.caseHistory
        .map((c) => `- ${c.title}: ${c.summary}`)
        .join("\n")}`
    }

    if (context.studyTopic) {
      contextPrompt += `\n\nCurrent study focus: ${context.studyTopic}`
    }

    // Search for relevant context if enabled
    if (includeContext) {
      try {
        const searchResults = await ragService.search(userMessage, {
          limit: 3,
          userId,
          includeKnowledgeBase: true,
        })

        if (searchResults.length > 0) {
          const contextText = ragService.formatContextForLLM(searchResults)
          contextPrompt += `\n\nRelevant Legal Reference:\n${contextText}`
        }
      } catch (error) {
        console.error("Error retrieving RAG context for tutor:", error)
      }
    }

    const messages: OpenRouterMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: contextPrompt },
    ]

    return this.chat(messages, {
      temperature: 0.7,
      max_tokens: 1000,
    })
  }

  /**
   * Generate mock exam from multiple cases or topics
   */
  async generateMockTest(
    topics: string[],
    numQuestions: number = 10,
    options: {
      userId?: string
      includeContext?: boolean
    } = {}
  ): Promise<{
    title: string
    questions: Array<{
      question: string
      options: string[]
      correct_answer: number
      explanation: string
      topic: string
    }>
  }> {
    const { userId, includeContext = true } = options

    const systemPrompt = `You are an expert legal AI assistant specializing in creating comprehensive law school mock examinations.
Your task is to create realistic exam questions that test deep understanding of legal principles across multiple topics.

Guidelines:
- Create challenging questions appropriate for law school level
- Provide 4 multiple-choice options (A, B, C, D)
- Ensure clear, unambiguous correct answers
- Include detailed explanations that aid learning
- Cover multiple legal principles and applications
- Use realistic case scenarios
- Format responses as JSON`

    let contextInfo = ""
    if (includeContext) {
      try {
        // Search for relevant cases/knowledge for each topic
        const allContext: string[] = []
        
        for (const topic of topics) {
          const results = await ragService.search(topic, {
            limit: 2,
            userId,
            includeKnowledgeBase: true,
          })

          if (results.length > 0) {
            allContext.push(`\n\n${topic}:\n${ragService.formatContextForLLM(results)}`)
          }
        }

        if (allContext.length > 0) {
          contextInfo = "\n\nLegal References:" + allContext.join("\n")
        }
      } catch (error) {
        console.error("Error retrieving RAG context for mock test:", error)
      }
    }

    const userPrompt = `Create a comprehensive mock law school exam with ${numQuestions} questions covering the following topics:
${topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}${contextInfo}

Provide your response as a JSON object with this structure:
{
  "title": "Descriptive exam title",
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Why this answer is correct",
      "topic": "Contract Law"
    }
  ]
}`

    const messages: OpenRouterMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]

    const response = await this.chat(messages, {
      temperature: 0.5,
      max_tokens: 4000,
    })

    try {
      const jsonMatch = response.match(/```json\n([\s\S]*?)```/) || response.match(/```\n([\s\S]*?)```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : response
      
      const parsed = JSON.parse(jsonStr.trim())
      return parsed
    } catch (error) {
      console.error("Failed to parse mock test JSON:", error)
      throw new Error("Failed to generate mock test")
    }
  }

  /**
   * Extract text from PDF content
   */
  async extractTextFromPDF(pdfContent: Buffer | string): Promise<string> {
    // For now, return a placeholder
    // TODO: Implement PDF text extraction
    return "PDF text extraction not yet implemented. Please provide the case text directly."
  }
}

// Export singleton instance
export const llmService = new LLMService()

// Export types and utilities
export type { OpenRouterMessage, OpenRouterRequest, OpenRouterResponse }

