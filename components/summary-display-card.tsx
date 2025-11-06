"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, FileText, AlertCircle, Sparkles } from "lucide-react"

interface Summary {
  issue: string
  rule: string
  analysis: string
  conclusion: string
}

interface SummaryDisplayCardProps {
  summary: Summary
  caseTitle: string
  onClose?: () => void
}

const iracSections = [
  { key: "issue", label: "Issue", color: "from-firm-red-500 to-firm-red-600", bgColor: "from-firm-red-600/5 to-firm-red-600/10", icon: "❓" },
  { key: "rule", label: "Rule", color: "from-firm-red-600 to-firm-red-700", bgColor: "from-firm-red-600/5 to-firm-red-700/10", icon: "📜" },
  { key: "analysis", label: "Analysis", color: "from-firm-black-600 to-firm-black-700", bgColor: "from-firm-black-800/30 to-firm-black-700/30", icon: "🔍" },
  { key: "conclusion", label: "Conclusion", color: "from-firm-red-700 to-firm-red-800", bgColor: "from-firm-red-700/5 to-firm-red-800/10", icon: "✅" },
]

export default function SummaryDisplayCard({ summary, caseTitle, onClose }: SummaryDisplayCardProps) {
  const isProcessing = summary.issue === "Analyzing..." || summary.issue === "Issue analysis pending"

  return (
    <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800 shadow-2xl relative overflow-hidden">
      {/* Animated Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-firm-red-600/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      
      <CardHeader className="relative z-10 pb-4 border-b border-firm-black-700">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-firm-red-600/20">
                <FileText className="w-5 h-5 text-firm-red-500" />
              </div>
              <CardTitle className="text-2xl font-black text-white">IRAC Summary</CardTitle>
            </div>
            <CardDescription className="mt-1 text-base text-gray-400 font-medium">
              {caseTitle}
            </CardDescription>
            <div className="flex items-center gap-2 mt-3">
              <Badge className="gap-1 bg-firm-black-800 text-gray-300 border border-firm-red-600/30 font-bold">
                <Sparkles className="w-3 h-3 text-firm-red-500" />
                AI-Generated Analysis
              </Badge>
              {isProcessing && (
                <Badge className="gap-1 bg-firm-black-800 text-gray-400 border border-firm-black-700 font-bold">
                  <span className="w-2 h-2 bg-firm-red-500 rounded-full animate-pulse" />
                  Processing...
                </Badge>
              )}
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0 hover:bg-firm-red-600/20 hover:text-firm-red-500 text-gray-500"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6 pt-6">
        {isProcessing ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 border-4 border-firm-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <p className="font-bold text-white text-lg">Analyzing case...</p>
              <p className="text-sm text-gray-500 mt-1">
                Our AI is generating your IRAC summary. This may take a moment.
              </p>
            </div>
          </div>
        ) : (
          <>
            {iracSections.map((section) => {
              const content = summary[section.key as keyof Summary]
              return (
                <div
                  key={section.key}
                  className="group relative overflow-hidden rounded-xl border-2 border-firm-black-700 p-6 hover:border-firm-red-600/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${section.color} shadow-lg`}>
                        <span className="text-xl">{section.icon}</span>
                      </div>
                      <h3 className="font-black text-xl text-white group-hover:text-firm-red-500 transition-colors">
                        {section.label}
                      </h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed pl-12 text-sm">
                      {content || `No ${section.label.toLowerCase()} available yet.`}
                    </p>
                  </div>
                </div>
              )
            })}

            <div className="bg-gradient-to-r from-firm-red-600/10 to-firm-red-700/10 border-2 border-firm-red-600/30 p-5 rounded-xl mt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-firm-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Important Note</p>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    This is an AI-generated summary for educational purposes only. Always consult with qualified legal professionals for actual case work and legal advice.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
