"use client"

import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface Flashcard {
  id: number
  question: string
  answer: string
}

interface FlashcardSetProps {
  flashcards: Flashcard[]
  flipped: number | null
  setFlipped: (id: number | null) => void
}

export default function FlashcardSet({ flashcards, flipped, setFlipped }: FlashcardSetProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const current = flashcards[currentIndex]

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length)
    setFlipped(null)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
    setFlipped(null)
  }

  const isFlipped = flipped === current.id

  return (
    <div className="space-y-6">
      {/* Main Flashcard */}
      <div
        className="relative h-80 md:h-96 cursor-pointer group"
        onClick={() => setFlipped(isFlipped ? null : current.id)}
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-firm-red-600 to-firm-red-700 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
        
        <Card
          className={`
            relative h-full flex items-center justify-center p-8 md:p-12 text-center 
            transition-all duration-500 transform border-2 
            ${isFlipped 
              ? 'scale-[0.98] border-firm-red-600 bg-gradient-to-br from-firm-red-600/10 via-firm-black-800 to-firm-black-900 shadow-2xl shadow-firm-red-600/20' 
              : 'border-firm-black-700 bg-gradient-to-br from-firm-black-800 via-firm-black-900 to-firm-black-800 hover:border-firm-red-600/50 hover:shadow-xl'
            }
          `}
        >
          <div className="space-y-6 max-w-3xl">
            {/* Badge */}
            <div className="flex items-center justify-center gap-2">
              <Badge 
                className={`
                  text-sm font-bold uppercase tracking-wider
                  ${isFlipped 
                    ? 'bg-firm-red-600 text-white border-0 shadow-lg shadow-firm-red-600/30' 
                    : 'bg-firm-black-700 text-gray-300 border-firm-black-600'
                  }
                `}
              >
                {isFlipped ? "Answer" : "Question"}
              </Badge>
            </div>

            {/* Content */}
            <p className={`
              text-2xl md:text-4xl font-bold leading-relaxed transition-all duration-300
              ${isFlipped ? 'text-white' : 'text-white'}
            `}>
              {isFlipped ? current.answer : current.question}
            </p>

            {/* Hint */}
            <div className="flex items-center justify-center gap-2 pt-4">
              <RotateCcw className={`
                w-4 h-4 transition-colors
                ${isFlipped ? 'text-firm-red-500' : 'text-gray-600'}
              `} />
              <p className="text-sm text-gray-500">
                Click to {isFlipped ? "show question" : "reveal answer"}
              </p>
            </div>
          </div>

          {/* Corner decoration */}
          <div className={`
            absolute top-4 right-4 w-12 h-12 rounded-full 
            ${isFlipped ? 'bg-firm-red-600/20' : 'bg-firm-black-700/50'}
            border-2 
            ${isFlipped ? 'border-firm-red-600/40' : 'border-firm-black-600'}
            transition-all duration-500
          `} />
        </Card>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <Button 
          variant="outline" 
          size="lg"
          onClick={handlePrev}
          className="
            border-2 border-firm-black-700 bg-firm-black-800/50 text-white
            hover:border-firm-red-600/50 hover:bg-firm-red-600/10
            transition-all font-bold
          "
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </Button>

        {/* Counter */}
        <div className="flex items-center gap-3 px-6 py-3 bg-firm-black-800 rounded-xl border-2 border-firm-black-700">
          <span className="text-2xl font-black text-firm-red-500">
            {currentIndex + 1}
          </span>
          <span className="text-lg text-gray-600 font-bold">/</span>
          <span className="text-lg text-gray-400 font-bold">{flashcards.length}</span>
        </div>

        <Button 
          variant="outline" 
          size="lg"
          onClick={handleNext}
          className="
            border-2 border-firm-black-700 bg-firm-black-800/50 text-white
            hover:border-firm-red-600/50 hover:bg-firm-red-600/10
            transition-all font-bold
          "
        >
          Next
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Progress Indicators */}
      <div className="flex gap-2 flex-wrap justify-center">
        {flashcards.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx)
              setFlipped(null)
            }}
            className={`
              w-3 h-3 rounded-full transition-all duration-200
              ${idx === currentIndex 
                ? "bg-firm-red-600 scale-125 shadow-lg shadow-firm-red-600/50" 
                : "bg-firm-black-700 hover:bg-firm-red-600/50 hover:scale-110"
              }
            `}
            aria-label={`Go to card ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
