"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface MultipleChoiceQuestionProps {
  question: {
    id: number
    text: string
    options: string[]
  }
  onSaveAnswer?: (answer: string) => void
  savedAnswer?: string
}

export default function MultipleChoiceQuestion({ question, onSaveAnswer, savedAnswer }: MultipleChoiceQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(savedAnswer || null)

  // Only update state from props on initial mount or when savedAnswer changes
  useEffect(() => {
    if (savedAnswer !== undefined) {
      setSelectedOption(savedAnswer)
    }
  }, [savedAnswer])

  // Only call onSaveAnswer when selectedOption changes
  useEffect(() => {
    if (selectedOption !== null && onSaveAnswer) {
      onSaveAnswer(selectedOption)
    }
  }, [selectedOption, onSaveAnswer])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>

      <RadioGroup value={selectedOption || ""} onValueChange={setSelectedOption} className="space-y-3">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={`flex items-center space-x-3 rounded-xl border p-4 transition-colors ${
              selectedOption === index.toString()
                ? "border-purple-200 bg-purple-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setSelectedOption(index.toString())}
          >
            <RadioGroupItem value={index.toString()} id={`option-${question.id}-${index}`} />
            <Label htmlFor={`option-${question.id}-${index}`} className="flex-grow cursor-pointer text-gray-700">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
