"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import TestTakingPage from "./test-taking-page"

export default function JoinViaCode() {
  const [testCode, setTestCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [joinedTest, setJoinedTest] = useState(false)
  const [testData, setTestData] = useState(null)

  // Handle input change with validation
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
    setTestCode(value)

    if (value.length > 0 && value.length !== 6) {
      setError("Please enter a valid 6-digit code.")
    } else {
      setError(null)
    }
  }, [])

  // Validate test code
  const isValidCode = testCode.length === 6

  // Mock test code validation
  const handleJoinTest = useCallback(() => {
    if (isValidCode) {
      // For demo purposes, create a mock test data
      const mockTestData = {
        title: "Physics Final Exam",
        durationInMinutes: 60,
        sections: [
          {
            id: 1,
            title: "Multiple Choice",
            questions: [
              {
                id: 1,
                text: "What is the formula for force?",
                options: ["F = ma", "E = mc²", "F = mv", "P = mv"],
              },
              {
                id: 2,
                text: "Which of the following is a unit of energy?",
                options: ["Newton", "Joule", "Pascal", "Ampere"],
              },
            ],
          },
        ],
      }

      setTestData(mockTestData)
      setJoinedTest(true)
    } else {
      setError("Please enter a valid 6-digit code.")
    }
  }, [isValidCode])

  // Handle key press for Enter key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && isValidCode) {
        handleJoinTest()
      }
    },
    [handleJoinTest, isValidCode],
  )

  if (joinedTest) {
    return <TestTakingPage testData={testData} />
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">Test Genius</h1>
          <p className="text-gray-600">Enter your test code to begin</p>
        </div>

        <Card className="border-gray-200 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100 pb-6">
            <CardTitle className="text-xl font-bold text-gray-800 text-center">Join a Test</CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="test-code" className="text-sm font-medium text-gray-700">
                Enter 6-digit Test Code
              </label>
              <Input
                id="test-code"
                placeholder="e.g., 843917"
                value={testCode}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="rounded-xl border-gray-300 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-center text-lg tracking-wider"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <p className="text-xs text-gray-500 text-center">Enter the 6-digit code provided by your instructor</p>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isValidCode && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="font-medium text-green-800 text-sm">Test Preview</h3>
                <p className="text-green-700 mt-1 text-sm">Final Exam - Physics</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">60 minutes</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">25 questions</span>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-gray-50 p-6 flex justify-center border-t border-gray-100">
            <Button
              onClick={handleJoinTest}
              disabled={!isValidCode}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 h-auto text-lg font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Test <ArrowRight className="h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have a test code?{" "}
            <Link href="#" className="text-purple-600 hover:text-purple-700 font-medium">
              Try a demo test
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
