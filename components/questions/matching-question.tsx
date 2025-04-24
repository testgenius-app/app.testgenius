"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface MatchingQuestionProps {
  question: {
    id: number
    text: string
    columnA: string[]
    columnB: string[]
  }
  onSaveAnswer?: (answer: { [key: number]: number }) => void
  savedAnswer?: { [key: number]: number }
}

export default function MatchingQuestion({ question, onSaveAnswer, savedAnswer }: MatchingQuestionProps) {
  const [selectedA, setSelectedA] = useState<number | null>(null)
  const [selectedB, setSelectedB] = useState<number | null>(null)
  const [matches, setMatches] = useState<{ [key: number]: number }>(savedAnswer || {})
  const [shuffledB, setShuffledB] = useState<string[]>([])

  // Shuffle column B items
  useEffect(() => {
    const shuffled = [...question.columnB]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setShuffledB(shuffled)
  }, [question.columnB])

  useEffect(() => {
    if (savedAnswer) {
      setMatches(savedAnswer)
    }
  }, [savedAnswer])

  useEffect(() => {
    if (onSaveAnswer) {
      onSaveAnswer(matches)
    }
  }, [matches, onSaveAnswer])

  const handleMatch = () => {
    if (selectedA !== null && selectedB !== null) {
      setMatches((prev) => ({
        ...prev,
        [selectedA]: selectedB,
      }))
      setSelectedA(null)
      setSelectedB(null)
    }
  }

  const removeMatch = (indexA: number) => {
    setMatches((prev) => {
      const newMatches = { ...prev }
      delete newMatches[indexA]
      return newMatches
    })
  }

  const isItemBMatched = (indexB: number) => {
    return Object.values(matches).includes(indexB)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column A */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 text-center">Column A</h4>
          {question.columnA.map((item, index) => (
            <div
              key={`A-${index}`}
              className={`relative rounded-xl border p-4 transition-colors ${
                selectedA === index
                  ? "border-purple-300 bg-purple-50"
                  : index in matches
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => {
                if (!(index in matches)) {
                  setSelectedA(index)
                }
              }}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-700">{item}</span>
                {index in matches && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeMatch(index)
                    }}
                  >
                    ×
                  </Button>
                )}
              </div>

              {index in matches && (
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  <span>{shuffledB[matches[index]]}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Column B */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 text-center">Column B</h4>
          {shuffledB.map((item, index) => (
            <div
              key={`B-${index}`}
              className={`rounded-xl border p-4 transition-colors ${
                selectedB === index
                  ? "border-purple-300 bg-purple-50"
                  : isItemBMatched(index)
                    ? "border-green-200 bg-green-50 opacity-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => {
                if (!isItemBMatched(index)) {
                  setSelectedB(index)
                }
              }}
            >
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedA !== null && selectedB !== null && (
        <div className="flex justify-center mt-4">
          <Button onClick={handleMatch} className="bg-purple-600 hover:bg-purple-700">
            Match Selected Items
          </Button>
        </div>
      )}
    </div>
  )
}
