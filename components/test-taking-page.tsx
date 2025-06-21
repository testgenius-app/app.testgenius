"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, Circle, AlertTriangle } from "lucide-react"
import { ONLINE_TEST_EVENTS } from "@/lib/socket-events"
import MultipleChoiceQuestion from "./questions/multiple-choice-question"
import TrueFalseQuestion from "./questions/true-false-question"
import ShortAnswerQuestion from "./questions/short-answer-question"
import MultipleSelectQuestion from "./questions/multiple-select-question"
import MatchingQuestion from "./questions/matching-question"
import ResultsView from "./results-view"
import LoadingSpinner from "./loading-spinner"

interface TestTakingPageProps {
  testData: any
  socket: any
}

export default function TestTakingPage({ testData, socket }: TestTakingPageProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [currentTask, setCurrentTask] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: any }>({})
  const [timeLeft, setTimeLeft] = useState(testData.durationInMinutes * 60)
  const [isTestCompleted, setIsTestCompleted] = useState(false)
  const [startTime] = useState(Date.now())

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Safe access to test data
  const safeTestData = testData || {}
  const sections = safeTestData.sections || []
  const currentSectionData = sections[currentSection] || { tasks: [] }
  const currentTaskData = currentSectionData.tasks?.[currentTask] || { questions: [] }
  const currentQuestionData = currentTaskData.questions?.[currentQuestion] || {}

  // Calculate total questions and progress
  const { totalQuestions, currentQuestionIndex, answeredCount } = useMemo(() => {
    let total = 0
    let current = 0
    let answered = 0

    sections.forEach((section, sIndex) => {
      section.tasks?.forEach((task, tIndex) => {
        task.questions?.forEach((question, qIndex) => {
          if (
            sIndex < currentSection ||
            (sIndex === currentSection && tIndex < currentTask) ||
            (sIndex === currentSection && tIndex === currentTask && qIndex < currentQuestion)
          ) {
            current++
          }
          if (answers[question.id] !== undefined) {
            answered++
          }
          total++
        })
      })
    })

    return { totalQuestions: total, currentQuestionIndex: current, answeredCount: answered }
  }, [sections, currentSection, currentTask, currentQuestion, answers])

  useEffect(() => {
    // Validate test data
    if (!testData || !testData.sections || testData.sections.length === 0) {
      setError("Invalid test data received")
      setIsLoading(false)
      return
    }

    // Check if we have questions
    const hasQuestions = testData.sections.some(
      (section) => section.tasks && section.tasks.some((task) => task.questions && task.questions.length > 0),
    )

    if (!hasQuestions) {
      setError("No questions found in this test")
      setIsLoading(false)
      return
    }

    setIsLoading(false)
  }, [testData])

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || isTestCompleted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTestCompleted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, isTestCompleted])

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  // Handle answer saving with socket emission
  const handleSaveAnswer = useCallback(
    (questionId: string | number, answer: any) => {
      console.log("Saving answer:", questionId, answer)

      setAnswers((prev) => {
        // Only update if the answer has actually changed
        if (prev[questionId] === answer) {
          return prev
        }
        return {
          ...prev,
          [questionId]: answer,
        }
      })

      // Emit SELECT_ANSWER socket event with proper payload structure
      if (socket) {
        const payload = {
          testId: (safeTestData.testId || safeTestData.id || "unknown").toString(),
          sectionId: (currentSectionData.id || currentSection).toString(),
          taskId: (currentTaskData.id || currentTask).toString(),
          questionId: questionId.toString(),
          answer: typeof answer === "object" ? JSON.stringify(answer) : answer.toString(),
        }

        console.log("Emitting SELECT_ANSWER event:", payload)
        socket.emit(ONLINE_TEST_EVENTS.SELECT_ANSWER, payload)
      } else {
        console.warn("Socket not available for emitting SELECT_ANSWER event")
      }
    },
    [
      socket,
      safeTestData.testId,
      safeTestData.id,
      currentSectionData.id,
      currentTaskData.id,
      currentSection,
      currentTask,
    ],
  )

  // Navigation functions
  const goToNextQuestion = () => {
    const nextQuestionInTask = currentQuestion + 1
    const nextTaskInSection = currentTask + 1
    const nextSection = currentSection + 1

    if (nextQuestionInTask < currentTaskData.questions?.length) {
      setCurrentQuestion(nextQuestionInTask)
    } else if (nextTaskInSection < currentSectionData.tasks?.length) {
      setCurrentTask(nextTaskInSection)
      setCurrentQuestion(0)
    } else if (nextSection < sections.length) {
      setCurrentSection(nextSection)
      setCurrentTask(0)
      setCurrentQuestion(0)
    }
  }

  const goToPreviousQuestion = () => {
    const prevQuestionInTask = currentQuestion - 1
    const prevTaskInSection = currentTask - 1
    const prevSection = currentSection - 1

    if (prevQuestionInTask >= 0) {
      setCurrentQuestion(prevQuestionInTask)
    } else if (prevTaskInSection >= 0) {
      const prevTaskData = currentSectionData.tasks?.[prevTaskInSection]
      setCurrentTask(prevTaskInSection)
      setCurrentQuestion((prevTaskData?.questions?.length || 1) - 1)
    } else if (prevSection >= 0) {
      const prevSectionData = sections[prevSection]
      const lastTaskIndex = (prevSectionData.tasks?.length || 1) - 1
      const lastTask = prevSectionData.tasks?.[lastTaskIndex]
      setCurrentSection(prevSection)
      setCurrentTask(lastTaskIndex)
      setCurrentQuestion((lastTask?.questions?.length || 1) - 1)
    }
  }

  const canGoNext = () => {
    return currentQuestionIndex < totalQuestions - 1
  }

  const canGoPrevious = () => {
    return currentQuestionIndex > 0
  }

  const handleSubmitTest = () => {
    // Emit FINISH_ONLINE_TEST_AS_PARTICIPANT socket event
    if (socket) {
      const testId = (safeTestData.testId || safeTestData.id || "unknown").toString()
      const payload = { testId }

      console.log("Emitting FINISH_ONLINE_TEST_AS_PARTICIPANT event:", payload)
      socket.emit(ONLINE_TEST_EVENTS.FINISH_ONLINE_TEST_AS_PARTICIPANT, payload)
    } else {
      console.warn("Socket not available for emitting FINISH_ONLINE_TEST_AS_PARTICIPANT event")
    }

    setIsTestCompleted(true)
  }

  // Render question based on type
  const renderQuestion = () => {
    if (!currentQuestionData.id) {
      return <div className="text-center text-gray-500">No question data available</div>
    }

    const questionProps = {
      question: currentQuestionData,
      onSaveAnswer: (answer: any) => handleSaveAnswer(currentQuestionData.id, answer),
      savedAnswer: answers[currentQuestionData.id],
    }

    switch (currentQuestionData.type) {
      case "multiple-choice":
        return <MultipleChoiceQuestion {...questionProps} />
      case "true-false":
        return <TrueFalseQuestion {...questionProps} />
      case "short-answer":
        return <ShortAnswerQuestion {...questionProps} />
      case "multiple-select":
        return <MultipleSelectQuestion {...questionProps} />
      case "matching":
        return <MatchingQuestion {...questionProps} />
      default:
        return <MultipleChoiceQuestion {...questionProps} />
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading test..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Test Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    )
  }

  // Show results if test is completed
  if (isTestCompleted) {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    return <ResultsView testData={testData} answers={answers} timeSpent={timeSpent} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-purple-600">Test Genius</h1>
            <Badge variant="outline" className="text-sm">
              {safeTestData.title || "Test"}
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1.5 rounded-full">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className={`font-medium ${timeLeft < 300 ? "text-red-600" : "text-purple-700"}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <Button onClick={handleSubmitTest} className="bg-green-600 hover:bg-green-700">
              Submit Test
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Progress Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">{answeredCount} answered</span>
              </div>
            </div>
            <Progress value={(currentQuestionIndex / totalQuestions) * 100} className="mt-2" />
          </CardHeader>
        </Card>

        {/* Section and Task Info */}
        <div className="mb-4 flex items-center space-x-2 text-sm text-gray-600">
          <span>Section: {currentSectionData.title || `Section ${currentSection + 1}`}</span>
          <span>•</span>
          <span>Task: {currentTaskData.title || `Task ${currentTask + 1}`}</span>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="p-6">{renderQuestion()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={!canGoPrevious()}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center space-x-2">
            {answers[currentQuestionData.id] !== undefined ? (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Answered</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-gray-400">
                <Circle className="h-4 w-4" />
                <span className="text-sm">Not answered</span>
              </div>
            )}
          </div>

          <Button
            onClick={canGoNext() ? goToNextQuestion : handleSubmitTest}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
          >
            <span>{canGoNext() ? "Next" : "Submit"}</span>
            {canGoNext() ? <ChevronRight className="h-4 w-4" /> : <Flag className="h-4 w-4" />}
          </Button>
        </div>

        {/* Warning for low time */}
        {timeLeft < 300 && timeLeft > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">Warning: Less than 5 minutes remaining!</span>
          </div>
        )}
      </div>
    </div>
  )
}
