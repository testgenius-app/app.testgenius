"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Clock, Calendar, ArrowLeft, RotateCcw, User, PieChart } from "lucide-react"
import Link from "next/link"

interface ResultsViewProps {
  testData: any
  answers: any
  timeSpent: number
}

export default function ResultsView({ testData, answers, timeSpent }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState("summary")

  // Calculate scores - memoized to prevent recalculation on re-renders
  const scores = useMemo(() => {
    const sectionScores = {}
    let totalCorrect = 0
    let totalQuestions = 0
    let totalAttempted = 0

    // Safe access to sections
    const sections = testData?.sections || []

    sections.forEach((section) => {
      let sectionCorrect = 0
      let sectionAttempted = 0
      const questions = section?.tasks?.flatMap((task) => task?.questions || []) || []

      questions.forEach((question) => {
        if (!question?.id) return // Skip if question doesn't have an ID

        totalQuestions++
        let isCorrect = false
        const isAttempted =
          question.id in answers &&
          answers[question.id] !== null &&
          (question.type !== "multiple-select" || answers[question.id].length > 0) &&
          (question.type !== "short-answer" || answers[question.id].trim !== "")

        if (isAttempted) {
          sectionAttempted++
          totalAttempted++

          switch (question.type) {
            case "multiple-choice":
              isCorrect = answers[question.id] === question.correctAnswer?.toString()
              break
            case "true-false":
              isCorrect = answers[question.id] === question.correctAnswer
              break
            case "multiple-select":
              // Check if arrays have the same elements
              const userAnswers = answers[question.id] || []
              const correctAnswers = question.correctAnswers?.map(String) || []
              isCorrect =
                userAnswers.length === correctAnswers.length &&
                userAnswers.every((item) => correctAnswers.includes(item))
              break
            case "matching":
              // Check if matching is correct
              const userMatches = answers[question.id] || {}
              const correctMatches = question.correctMatches || {}
              isCorrect = Object.keys(userMatches).length === Object.keys(correctMatches).length
              if (isCorrect) {
                for (const key in correctMatches) {
                  if (userMatches[key] !== correctMatches[key]) {
                    isCorrect = false
                    break
                  }
                }
              }
              break
            case "short-answer":
              // For short answer, we'll mark it as "needs review" (null)
              isCorrect = null
              break
          }
        }

        if (isCorrect === true) {
          sectionCorrect++
          totalCorrect++
        }
      })

      sectionScores[section?.id || `section-${sections.indexOf(section)}`] = {
        correct: sectionCorrect,
        total: questions.length,
        attempted: sectionAttempted,
        percentage: questions.length > 0 ? (sectionCorrect / questions.length) * 100 : 0,
      }
    })

    return {
      sectionScores,
      totalCorrect,
      totalQuestions,
      totalAttempted,
      percentage: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
    }
  }, [testData, answers])

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs > 0 ? hrs + "h " : ""}${mins}m ${secs}s`
  }

  // Get current date
  const getCurrentDate = () => {
    const date = new Date()
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-purple-600">Test Genius</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <Card className="border-gray-200 shadow-md rounded-2xl overflow-hidden mb-8">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100 pb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <p className="text-sm font-medium text-purple-600">Test Results</p>
                <CardTitle className="text-2xl font-bold text-gray-800">{testData?.title || "Test"}</CardTitle>
                {testData?.userName && (
                  <div className="flex items-center mt-2 text-gray-600">
                    <User className="h-4 w-4 mr-1" />
                    <span>{testData.userName}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center justify-center bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-gray-800">
                  {scores.totalCorrect}/{scores.totalQuestions}
                </div>
                <div className="text-lg font-medium text-purple-600">{scores.percentage.toFixed(1)}%</div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Completion Date</p>
                  <p className="font-medium">{getCurrentDate()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Time Spent</p>
                  <p className="font-medium">{formatTime(timeSpent)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <PieChart className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Completion</p>
                  <p className="font-medium">
                    {scores.totalAttempted}/{scores.totalQuestions} questions attempted
                  </p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="summary" onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="details">Question Details</TabsTrigger>
              </TabsList>
              <TabsContent value="summary" className="pt-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-800">Section Breakdown</h3>

                  {(testData?.sections || []).map((section, sectionIndex) => {
                    const sectionScore = scores.sectionScores[section?.id || `section-${sectionIndex}`]
                    if (!sectionScore) return null

                    return (
                      <div key={section?.id || `section-${sectionIndex}`} className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-gray-700">
                            {section?.title || `Section ${sectionIndex + 1}`}
                          </h4>
                          <div className="text-sm font-medium">
                            {sectionScore.correct}/{sectionScore.total} ({sectionScore.percentage.toFixed(0)}%)
                          </div>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-xl">
                          <div className="flex flex-col sm:flex-row justify-between mb-2">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">{sectionScore.attempted}</span> of{" "}
                              <span className="font-medium">{sectionScore.total}</span> questions attempted
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-green-600">{sectionScore.correct}</span> correct ·{" "}
                              <span className="font-medium text-red-600">
                                {sectionScore.attempted - sectionScore.correct}
                              </span>{" "}
                              incorrect
                            </div>
                          </div>

                          {/* Visual representation of section performance */}
                          <div className="relative h-8 bg-gray-200 rounded-lg overflow-hidden">
                            <div
                              className="absolute top-0 left-0 h-full bg-green-500"
                              style={{ width: `${(sectionScore.correct / sectionScore.total) * 100}%` }}
                            ></div>
                            <div
                              className="absolute top-0 left-0 h-full bg-red-500"
                              style={{
                                width: `${((sectionScore.attempted - sectionScore.correct) / sectionScore.total) * 100}%`,
                                marginLeft: `${(sectionScore.correct / sectionScore.total) * 100}%`,
                              }}
                            ></div>
                          </div>

                          <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
              <TabsContent value="details" className="pt-6">
                <div className="space-y-6">
                  {(testData?.sections || []).map((section, sectionIndex) => (
                    <div key={section?.id || `section-${sectionIndex}`} className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-800">
                        {section?.title || `Section ${sectionIndex + 1}`}
                      </h3>
                      <div className="space-y-4">
                        {(section?.tasks?.flatMap((task) => task?.questions || []) || []).map(
                          (question, questionIndex) => {
                            if (!question?.id) return null

                            let isCorrect = false
                            let userAnswer = "Not answered"
                            const isAttempted = question.id in answers && answers[question.id] !== null

                            if (isAttempted) {
                              switch (question.type) {
                                case "multiple-choice":
                                  isCorrect = answers[question.id] === question.correctAnswer?.toString()
                                  userAnswer =
                                    question.options?.[Number.parseInt(answers[question.id])] || "Invalid option"
                                  break
                                case "true-false":
                                  isCorrect = answers[question.id] === question.correctAnswer
                                  userAnswer = answers[question.id] ? "True" : "False"
                                  break
                                case "multiple-select":
                                  // For simplicity in display
                                  const selectedOptions = (answers[question.id] || [])
                                    .map((idx) => question.options?.[Number.parseInt(idx)])
                                    .filter(Boolean)
                                  userAnswer = selectedOptions.join(", ") || "None selected"

                                  // Check if correct
                                  const userAnswerIds = answers[question.id] || []
                                  const correctAnswerIds = question.correctAnswers?.map(String) || []
                                  isCorrect =
                                    userAnswerIds.length === correctAnswerIds.length &&
                                    userAnswerIds.every((item) => correctAnswerIds.includes(item))
                                  break
                                case "matching":
                                  // Simplified display for matching
                                  userAnswer = "See matching details"

                                  // Check if matching is correct
                                  const userMatches = answers[question.id] || {}
                                  const correctMatches = question.correctMatches || {}
                                  isCorrect = Object.keys(userMatches).length === Object.keys(correctMatches).length
                                  if (isCorrect) {
                                    for (const key in correctMatches) {
                                      if (userMatches[key] !== correctMatches[key]) {
                                        isCorrect = false
                                        break
                                      }
                                    }
                                  }
                                  break
                                case "short-answer":
                                  userAnswer = answers[question.id] || "No answer provided"
                                  // Short answers need manual review
                                  isCorrect = null
                                  break
                              }
                            }

                            return (
                              <div
                                key={question.id}
                                className={`p-4 rounded-xl border ${
                                  !isAttempted
                                    ? "border-gray-200 bg-gray-50"
                                    : isCorrect === true
                                      ? "border-green-200 bg-green-50"
                                      : isCorrect === false
                                        ? "border-red-200 bg-red-50"
                                        : "border-yellow-200 bg-yellow-50"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-1">
                                    {!isAttempted ? (
                                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                        <span className="text-xs font-bold text-gray-500">-</span>
                                      </div>
                                    ) : isCorrect === true ? (
                                      <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : isCorrect === false ? (
                                      <XCircle className="h-5 w-5 text-red-600" />
                                    ) : (
                                      <div className="h-5 w-5 rounded-full border-2 border-yellow-400 flex items-center justify-center">
                                        <span className="text-xs font-bold text-yellow-600">?</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {question.text || "Question text not available"}
                                    </p>
                                    <div className="mt-2 text-sm">
                                      <div className="flex flex-col gap-1">
                                        <div className="flex items-center">
                                          <span className="text-gray-500 w-24">Your answer:</span>
                                          <span
                                            className={
                                              !isAttempted
                                                ? "text-gray-400 italic"
                                                : isCorrect === true
                                                  ? "text-green-600 font-medium"
                                                  : isCorrect === false
                                                    ? "text-red-600 font-medium"
                                                    : "text-yellow-600"
                                            }
                                          >
                                            {userAnswer}
                                          </span>
                                        </div>
                                        {(isCorrect === false || !isAttempted) && question.type !== "short-answer" && (
                                          <div className="flex items-center">
                                            <span className="text-gray-500 w-24">Correct answer:</span>
                                            <span className="text-green-600 font-medium">
                                              {question.type === "multiple-choice"
                                                ? question.options?.[question.correctAnswer] || "Not available"
                                                : question.type === "true-false"
                                                  ? question.correctAnswer
                                                    ? "True"
                                                    : "False"
                                                  : question.type === "multiple-select"
                                                    ? question.correctAnswers
                                                        ?.map((idx) => question.options?.[idx])
                                                        .filter(Boolean)
                                                        .join(", ") || "Not available"
                                                    : "See correct answer"}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          },
                        )}
                      </div>
                      <Separator className="my-6" />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="flex items-center gap-2" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2" asChild>
            <Link href="/">
              <RotateCcw className="h-4 w-4" /> Retake Test
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
