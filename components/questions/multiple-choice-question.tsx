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

  const handleOptionChange = (value: string) => {
    setSelectedOption(value)
    // Call onSaveAnswer immediately when user selects an option
    if (onSaveAnswer) {
      onSaveAnswer(value)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>

      <RadioGroup value={selectedOption || ""} onValueChange={handleOptionChange} className="space-y-3">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={`flex items-center space-x-3 rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer ${
              selectedOption === option
                ? "border-purple-500 bg-purple-100 shadow-md"
                : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
            }`}
            onClick={() => handleOptionChange(option)}
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
