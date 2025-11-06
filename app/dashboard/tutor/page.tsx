"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2,
  MessageSquare,
  Lightbulb,
  BookOpen,
  FileText,
  Zap,
  X
} from "lucide-react"
import MarkdownMessage from "@/components/markdown-message"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your **AI legal tutor** powered by Google Gemini. Ask me anything about law - from basic concepts to complex case analysis.\n\n**I can help you with:**\n- Explaining legal concepts\n- Analyzing cases\n- Answering questions\n- Providing examples\n- IRAC analysis guidance\n\nHow can I help you study today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageContent = input
    setInput("")
    setLoading(true)

        try {
          // Use unified LLM service (Tauri or API)
          const { unifiedLLMService } = await import("@/lib/unified-llm")
          const response = await unifiedLLMService.tutorChat(messageContent, {})

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response,
            timestamp: new Date(),
          }

          setMessages((prev) => [...prev, assistantMessage])
        } catch (error) {
          console.error("Error getting tutor response:", error)
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "I'm sorry, I encountered an error connecting to the AI tutor. Please try again.",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
        } finally {
          setLoading(false)
        }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendMessage()
  }

  const suggestedQuestions = [
    {
      question: "Explain mens rea in criminal law",
      icon: BookOpen,
      category: "Criminal Law"
    },
    {
      question: "What is the difference between contract and tort?",
      icon: FileText,
      category: "Legal Concepts"
    },
    {
      question: "How do I analyze a negligence case?",
      icon: Lightbulb,
      category: "Case Analysis"
    },
  ]

  return (
    <div className="min-h-full bg-gradient-to-br from-firm-black-950 via-firm-black-900 to-firm-black-950 flex flex-col h-[calc(100vh-80px)]">
      <div className="p-6 md:p-8 space-y-6 flex flex-col flex-1 max-w-[1800px] mx-auto w-full">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-firm-red-600/20 bg-gradient-to-br from-firm-black-900 via-firm-black-800 to-firm-black-900 p-6 md:p-8">
          {/* Animated Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-firm-red-600/10 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-firm-red-600/20 rounded-2xl border-2 border-firm-red-600/30 shadow-lg shadow-firm-red-600/20">
                <MessageSquare className="w-8 h-8 text-firm-red-500" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  AI Legal <span className="text-firm-red-500">Tutor</span>
                </h1>
                <p className="text-sm md:text-base text-gray-400 mt-1">
                  Chat with your personalized law learning assistant
                </p>
              </div>
            </div>
            
            <Badge className="bg-firm-black-800 text-gray-300 border-2 border-firm-red-600/30 px-4 py-2 text-sm font-bold">
              <Sparkles className="w-4 h-4 mr-2 text-firm-red-500" />
              Powered by Gemini
            </Badge>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800 min-h-0 shadow-xl">
          <CardHeader className="border-b border-firm-black-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-firm-red-600/20 rounded-lg">
                <Bot className="w-5 h-5 text-firm-red-500" />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-white">Active Conversation</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">
                  Ask questions and get instant AI-powered responses
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-0">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-firm-red-600 to-firm-red-700 flex items-center justify-center shadow-lg shadow-firm-red-600/30 border-2 border-firm-red-500/30">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
                <div className={`flex flex-col gap-1.5 max-w-[85%] md:max-w-2xl ${message.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`relative px-5 py-3.5 rounded-2xl shadow-lg ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-firm-red-600 to-firm-red-700 text-white rounded-br-md border-2 border-firm-red-500/30 shadow-firm-red-600/30"
                        : "bg-firm-black-800 text-gray-100 border-2 border-firm-black-700 rounded-bl-md"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <MarkdownMessage content={message.content} className="text-sm leading-relaxed prose prose-invert max-w-none" />
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
                    )}
                  </div>
                  <span className={`text-xs text-gray-600 px-2 font-medium ${message.role === "user" ? "text-right" : "text-left"}`}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-firm-black-800 border-2 border-firm-red-600/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-firm-red-500" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-firm-red-600 to-firm-red-700 flex items-center justify-center shadow-lg shadow-firm-red-600/30 border-2 border-firm-red-500/30">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="bg-firm-black-800 border-2 border-firm-black-700 px-5 py-3.5 rounded-2xl rounded-bl-md shadow-lg">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 bg-firm-red-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2.5 h-2.5 bg-firm-red-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2.5 h-2.5 bg-firm-red-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
        </Card>

        {/* Suggested Questions */}
        {messages.length === 1 && !loading && (
          <Card className="border-2 border-firm-red-600/30 bg-gradient-to-br from-firm-red-600/5 via-firm-black-900 to-firm-black-900">
            <CardHeader className="border-b border-firm-black-700 pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-firm-red-500" />
                <CardTitle className="text-lg font-black text-white">Suggested Questions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestedQuestions.map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(item.question)
                        document.getElementById("tutor-input")?.focus()
                      }}
                      className="group text-left p-5 rounded-xl border-2 border-firm-black-700 bg-firm-black-800/50 hover:border-firm-red-600/50 hover:bg-firm-black-800 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-lg bg-firm-red-600/20 group-hover:bg-firm-red-600/30 transition-colors">
                          <Icon className="w-5 h-5 text-firm-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge className="text-xs mb-2 bg-firm-black-700 text-gray-400 border-0 font-bold">
                            {item.category}
                          </Badge>
                          <p className="text-sm font-bold text-white group-hover:text-firm-red-500 transition-colors line-clamp-2">
                            {item.question}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="relative flex-1">
            <Input
              id="tutor-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your question about law..."
              disabled={loading}
              className="pr-12 border-2 border-firm-black-700 bg-firm-black-800 text-white placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-firm-red-600/30 focus-visible:border-firm-red-600/50 h-14 text-base font-medium"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
            {input.trim() && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 text-gray-500 hover:text-white hover:bg-firm-black-700"
                onClick={() => setInput("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={loading || !input.trim()} 
            size="icon"
            className="h-14 w-14 bg-gradient-to-br from-firm-red-600 to-firm-red-700 hover:from-firm-red-700 hover:to-firm-red-800 text-white shadow-lg shadow-firm-red-600/30 hover:shadow-xl hover:shadow-firm-red-600/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-firm-red-500/30"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
