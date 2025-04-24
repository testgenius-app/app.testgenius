"use client"

import { useState, useEffect } from "react"
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

  useEffect(() => {
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
          className="min-h-[150px] resize-y border-gray-300 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 rounded-xl"
          value={answer}
          onChange={(e) => setAnswer(e.target.value.slice(0, maxLength))}
        />
        <div className="flex justify-end">
          <span className="text-sm text-gray-500">
            {answer.length}/{maxLength} characters
          </span>
        </div>
      </div>
    </div>
  )
}
