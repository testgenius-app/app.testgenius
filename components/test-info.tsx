"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, FileText, CheckSquare, Brain, BookOpen } from "lucide-react"

interface TestInfoProps {
  testData: any
  totalQuestions: number
  onStartTest: () => void
}

export default function TestInfo({ testData, totalQuestions, onStartTest }: TestInfoProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Test Genius</h1>
          </div>
        </div>

        <Card className="border-gray-200 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100">
            <CardTitle className="text-2xl font-bold text-gray-800">{testData.title || "Test"}</CardTitle>
            {testData.subject && (
              <div className="flex items-center mt-2 text-purple-600">
                <BookOpen className="h-4 w-4 mr-2" />
                <span className="font-medium">{testData.subject}</span>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {testData.description && (
              <div className="text-gray-600">
                <p>{testData.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <FileText className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Sections</p>
                  <p className="font-medium">{testData.sections?.length || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <CheckSquare className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Questions</p>
                  <p className="font-medium">{totalQuestions}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Time Limit</p>
                  <p className="font-medium">{testData.durationInMinutes} minutes</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h3 className="font-medium text-blue-800">Important Instructions:</h3>
              <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                <li>Once started, the timer cannot be paused</li>
                <li>Answer all questions to the best of your ability</li>
                <li>You can navigate between questions freely</li>
                <li>Your answers are automatically saved</li>
                <li>Submit your test before the time expires</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="bg-gray-50 p-6 flex justify-center border-t border-gray-100">
            <Button
              onClick={onStartTest}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 h-auto text-lg font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Start Test
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
