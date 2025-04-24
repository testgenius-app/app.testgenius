"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface MultipleSelectQuestionProps {
  question: {
    id: number
    text: string
    options: string[]
  }
  onSaveAnswer?: (answer: string[]) => void
  savedAnswer?: string[]
}

export default function MultipleSelectQuestion({ question, onSaveAnswer, savedAnswer }: MultipleSelectQuestionProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(savedAnswer || [])

  useEffect(() => {
    if (savedAnswer) {
      setSelectedOptions(savedAnswer)
    }
  }, [savedAnswer])

  useEffect(() => {
    if (onSaveAnswer) {
      onSaveAnswer(selectedOptions)
    }
  }, [selectedOptions, onSaveAnswer])

  const toggleOption = (optionIndex: string) => {
    setSelectedOptions((prev) => {
      if (prev.includes(optionIndex)) {
        return prev.filter((item) => item !== optionIndex)
      } else {
        return [...prev, optionIndex]
      }
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>
      <p className="text-sm text-gray-500 italic">Select all that apply</p>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={`flex items-center space-x-3 rounded-xl border p-4 transition-colors ${
              selectedOptions.includes(index.toString())
                ? "border-purple-200 bg-purple-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => toggleOption(index.toString())}
          >
            <Checkbox
              id={`option-${question.id}-${index}`}
              checked={selectedOptions.includes(index.toString())}
              onCheckedChange={() => toggleOption(index.toString())}
            />
            <Label htmlFor={`option-${question.id}-${index}`} className="flex-grow cursor-pointer text-gray-700">
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
