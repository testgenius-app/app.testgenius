"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

interface TrueFalseQuestionProps {
  question: {
    id: number
    text: string
  }
  onSaveAnswer?: (answer: boolean) => void
  savedAnswer?: boolean
}

export default function TrueFalseQuestion({ question, onSaveAnswer, savedAnswer }: TrueFalseQuestionProps) {
  const [answer, setAnswer] = useState<boolean | null>(savedAnswer !== undefined ? savedAnswer : null)

  useEffect(() => {
    if (savedAnswer !== undefined) {
      setAnswer(savedAnswer)
    }
  }, [savedAnswer])

  const handleAnswerSelect = (value: boolean) => {
    setAnswer(value)
    // Call onSaveAnswer immediately when user selects an answer
    if (onSaveAnswer) {
      onSaveAnswer(value)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>

      <div className="flex gap-4">
        <Button
          type="button"
          variant={answer === true ? "default" : "outline"}
          className={`flex-1 py-6 rounded-xl transition-all duration-200 ${
            answer === true
              ? "bg-green-600 hover:bg-green-700 shadow-lg scale-105"
              : "border-gray-300 hover:border-green-400 hover:bg-green-50"
          }`}
          onClick={() => handleAnswerSelect(true)}
        >
          <CheckCircle className={`h-5 w-5 mr-2 ${answer === true ? "text-white" : "text-green-600"}`} />
          <span className={answer === true ? "text-white font-semibold" : "text-gray-700"}>True</span>
        </Button>

        <Button
          type="button"
          variant={answer === false ? "default" : "outline"}
          className={`flex-1 py-6 rounded-xl transition-all duration-200 ${
            answer === false
              ? "bg-red-600 hover:bg-red-700 shadow-lg scale-105"
              : "border-gray-300 hover:border-red-400 hover:bg-red-50"
          }`}
          onClick={() => handleAnswerSelect(false)}
        >
          <XCircle className={`h-5 w-5 mr-2 ${answer === false ? "text-white" : "text-red-600"}`} />
          <span className={answer === false ? "text-white font-semibold" : "text-gray-700"}>False</span>
        </Button>
      </div>
    </div>
  )
}
