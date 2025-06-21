"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"

interface ShortAnswerQuestionProps {
  question: {
    id: number
    text: string
    maxLength?: number
  }
  onSaveAnswer?: (answer: string) => void
  savedAnswer?: string
}

export default function ShortAnswerQuestion({ question, onSaveAnswer, savedAnswer }: ShortAnswerQuestionProps) {
  const [answer, setAnswer] = useState(savedAnswer || "")
  const maxLength = question.maxLength || 500

  useEffect(() => {
    if (savedAnswer) {
      setAnswer(savedAnswer)
    }
  }, [savedAnswer])

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswer = e.target.value.slice(0, maxLength)
    setAnswer(newAnswer)
  }

  const handleBlur = useCallback(() => {
    // Save answer when user finishes typing (on blur)
    if (onSaveAnswer) {
      onSaveAnswer(answer)
    }
  }, [answer, onSaveAnswer])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>

      <div className="space-y-2">
        <Textarea
          placeholder="Type your answer here..."
          className={`min-h-[150px] resize-y border-2 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 rounded-xl transition-all duration-200 ${
            answer.length > 0 ? "border-purple-300 bg-purple-50" : "border-gray-300"
          }`}
          value={answer}
          onChange={handleAnswerChange}
          onBlur={handleBlur}
        />
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {answer.length > 0 && <span className="text-sm text-purple-600 font-medium">✓ Answer provided</span>}
          </div>
          <span className={`text-sm ${answer.length > maxLength * 0.9 ? "text-red-500" : "text-gray-500"}`}>
            {answer.length}/{maxLength} characters
          </span>
        </div>
      </div>
    </div>
  )
}
