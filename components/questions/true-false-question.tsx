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

  useEffect(() => {
    if (answer !== null && onSaveAnswer) {
      onSaveAnswer(answer)
    }
  }, [answer, onSaveAnswer])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>

      <div className="flex gap-4">
        <Button
          type="button"
          variant={answer === true ? "default" : "outline"}
          className={`flex-1 py-6 rounded-xl ${
            answer === true
              ? "bg-green-600 hover:bg-green-700"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
          onClick={() => setAnswer(true)}
        >
          <CheckCircle className={`h-5 w-5 mr-2 ${answer === true ? "text-white" : "text-green-600"}`} />
          <span className={answer === true ? "text-white" : "text-gray-700"}>True</span>
        </Button>

        <Button
          type="button"
          variant={answer === false ? "default" : "outline"}
          className={`flex-1 py-6 rounded-xl ${
            answer === false ? "bg-red-600 hover:bg-red-700" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
          onClick={() => setAnswer(false)}
        >
          <XCircle className={`h-5 w-5 mr-2 ${answer === false ? "text-white" : "text-red-600"}`} />
          <span className={answer === false ? "text-white" : "text-gray-700"}>False</span>
        </Button>
      </div>
    </div>
  )
}
