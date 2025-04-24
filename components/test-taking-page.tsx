"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Brain } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Socket } from "socket.io-client"
import { ONLINE_TEST_EVENTS } from "@/lib/socket-events"

interface TestTakingPageProps {
  testData?: any
  socket?: Socket
}

export default function TestTakingPage({ testData = {}, socket }: TestTakingPageProps) {
  // Default test data if none is provided
  const defaultTestData = {
    title: "Test",
    subject: "",
    durationInMinutes: 60,
    description: "",
    sections: [
      {
        id: 1,
        title: "Section",
        instruction: "",
        tasks: [
          {
            id: 1,
            title: "Task",
            questions: [],
          },
        ],
      },
    ],
  }

  // Use provided testData or fallback to default
  const safeTestData = testData && Object.keys(testData).length > 0 ? testData : defaultTestData

  const [currentSection, setCurrentSection] = useState(0)
  const [currentTask, setCurrentTask] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(safeTestData.durationInMinutes * 60 || 3600)
  const [answers, setAnswers] = useState({})
  const [testSubmitted, setTestSubmitted] = useState(false)

  // Ensure sections exist
  const sections = safeTestData.sections || []

  // Safely get current section
  const currentSectionData = sections[currentSection] || {
    title: "Section",
    instruction: "",
    tasks: [],
  }

  // Safely get current task
  const currentTaskData = currentSectionData.tasks?.[currentTask] || {
    title: "Task",
    questions: [],
  }

  // Safely get current question
  const currentQuestionData = currentTaskData.questions?.[currentQuestion] || {
    id: 0,
    text: "No question available",
    options: [],
    type: "multiple_choice",
  }

  // Log current state for debugging
  useEffect(() => {
    console.log("Current section:", currentSection, "Current task:", currentTask, "Current question:", currentQuestion)
    console.log("Current question data:", currentQuestionData)
  }, [currentSection, currentTask, currentQuestion, currentQuestionData])

  // Timer effect
  useEffect(() => {
    console.log("Test data in TestTakingPage:", safeTestData)
    setTimeLeft(safeTestData.durationInMinutes * 60 || 3600)

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [safeTestData])

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  // Calculate total questions across all sections and tasks
  const calculateTotalQuestions = useCallback(() => {
    let total = 0
    if (!sections || !Array.isArray(sections)) return 0

    sections.forEach((section) => {
      if (!section || !section.tasks) return

      section.tasks.forEach((task) => {
        if (!task || !task.questions) return
        total += task.questions.length || 0
      })
    })
    return total || 1
  }, [sections])

  const totalQuestions = calculateTotalQuestions()

  // Calculate current question number across all sections and tasks
  const calculateCurrentQuestionNumber = useCallback(() => {
    let questionNumber = 0

    for (let s = 0; s < sections.length; s++) {
      const section = sections[s]
      if (!section || !section.tasks) continue

      for (let t = 0; t < (section.tasks?.length || 0); t++) {
        const task = section.tasks[t]
        if (!task || !task.questions) continue

        if (s < currentSection || (s === currentSection && t < currentTask)) {
          // Add all questions from previous sections and tasks
          questionNumber += task.questions?.length || 0
        } else if (s === currentSection && t === currentTask) {
          // Add current question index
          questionNumber += currentQuestion
          break
        }
      }

      if (s >= currentSection) break
    }

    return questionNumber + 1
  }, [currentSection, currentTask, currentQuestion, sections])

  // Navigation handlers
  const handleNextQuestion = useCallback(() => {
    const currentTaskQuestions = currentTaskData.questions || []

    if (currentQuestion < currentTaskQuestions.length - 1) {
      // Move to next question in current task
      setCurrentQuestion((prev) => prev + 1)
    } else {
      // Check if there are more tasks in current section
      if (currentTask < (currentSectionData.tasks?.length || 0) - 1) {
        setCurrentTask((prev) => prev + 1)
        setCurrentQuestion(0)
      } else if (currentSection < sections.length - 1) {
        // Move to next section
        setCurrentSection((prev) => prev + 1)
        setCurrentTask(0)
        setCurrentQuestion(0)
      }
    }
  }, [
    currentSection,
    currentTask,
    currentQuestion,
    currentTaskData.questions,
    currentSectionData.tasks,
    sections.length,
  ])

  const handlePrevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      // Move to previous question in current task
      setCurrentQuestion((prev) => prev - 1)
    } else if (currentTask > 0) {
      // Move to last question of previous task
      setCurrentTask((prev) => prev - 1)
      const prevTaskQuestions = currentSectionData.tasks?.[currentTask - 1]?.questions || []
      setCurrentQuestion(Math.max(prevTaskQuestions.length - 1, 0))
    } else if (currentSection > 0) {
      // Move to last task of previous section
      setCurrentSection((prev) => prev - 1)
      const prevSection = sections[currentSection - 1] || { tasks: [] }
      const prevSectionTasks = prevSection.tasks || []
      setCurrentTask(Math.max(prevSectionTasks.length - 1, 0))

      // Get the last question of the last task in the previous section
      const lastTask = prevSectionTasks[prevSectionTasks.length - 1] || { questions: [] }
      const lastTaskQuestions = lastTask.questions || []
      setCurrentQuestion(Math.max(lastTaskQuestions.length - 1, 0))
    }
  }, [currentSection, currentTask, currentQuestion, currentSectionData.tasks, sections])

  const handleSubmitTest = useCallback(() => {
    if (socket) {
      socket.emit(ONLINE_TEST_EVENTS.FINISH_ONLINE_TEST, {
        answers,
        code: testData.code || testData.tempCodeId,
      })
    }
    setTestSubmitted(true)
  }, [answers, socket, testData])

  const handleSaveAnswer = useCallback((questionId: number | string, answer: any) => {
    console.log("Saving answer:", questionId, answer)
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }, [])

  // Render a question based on its type
  const renderQuestion = useCallback(
    (question: any) => {
      if (!question) return <div>No question available</div>

      const questionId = question.id
      const currentAnswer = answers[questionId]
      const questionType = question.type?.toLowerCase() || "multiple_choice"

      console.log("Rendering question:", question)
      console.log("Question type:", questionType)

      switch (questionType) {
        case "multiple_choice":
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>

              <RadioGroup
                value={currentAnswer !== undefined ? currentAnswer.toString() : ""}
                onValueChange={(value) => handleSaveAnswer(questionId, value)}
                className="space-y-3"
              >
                {(question.options || []).map((option: string, index: number) => {
                  const isSelected = currentAnswer === index.toString()

                  return (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 rounded-xl border p-4 transition-colors cursor-pointer ${
                        isSelected
                          ? "border-purple-200 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => handleSaveAnswer(questionId, index.toString())}
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${questionId}-${index}`} />
                      <Label
                        htmlFor={`option-${questionId}-${index}`}
                        className="flex-grow cursor-pointer text-gray-700"
                      >
                        {option}
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>
          )

        case "true_false":
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>

              <RadioGroup
                value={currentAnswer !== undefined ? currentAnswer.toString() : ""}
                onValueChange={(value) => handleSaveAnswer(questionId, value === "true")}
                className="space-y-3"
              >
                {["True", "False"].map((option, index) => {
                  const optionValue = index === 0 ? "true" : "false"
                  const isSelected = currentAnswer === (index === 0)

                  return (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 rounded-xl border p-4 transition-colors cursor-pointer ${
                        isSelected
                          ? "border-purple-200 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => handleSaveAnswer(questionId, index === 0)}
                    >
                      <RadioGroupItem value={optionValue} id={`option-${questionId}-${index}`} />
                      <Label
                        htmlFor={`option-${questionId}-${index}`}
                        className="flex-grow cursor-pointer text-gray-700"
                      >
                        {option}
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>
          )

        case "short_answer":
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>
              <Textarea
                placeholder="Type your answer here..."
                value={currentAnswer || ""}
                onChange={(e) => handleSaveAnswer(questionId, e.target.value)}
                className="min-h-[150px] resize-y"
              />
            </div>
          )

        case "matching_the_headings":
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-800">
                  Matching questions are best completed on a larger screen. Please match each item from the left column
                  with the appropriate item from the right column.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Items to Match</h4>
                  {question.options?.map((option: string, index: number) => (
                    <div key={index} className="p-3 border rounded-lg bg-gray-50">
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )

        case "fill_in_the_blank":
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentAnswer || ""}
                  onChange={(e) => handleSaveAnswer(questionId, e.target.value)}
                  className="border rounded-md p-2 flex-1"
                  placeholder="Your answer"
                />
              </div>
            </div>
          )

        case "reading_passage":
          return (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <h4 className="font-medium text-blue-800 mb-2">Reading Passage</h4>
                <p className="text-blue-700">
                  {question.passage || "Please read the passage carefully and answer the question below."}
                </p>
              </div>
              <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>
              <Textarea
                placeholder="Type your answer here..."
                value={currentAnswer || ""}
                onChange={(e) => handleSaveAnswer(questionId, e.target.value)}
                className="min-h-[150px] resize-y"
              />
            </div>
          )

        default:
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>
              <p className="text-gray-500">
                This question type ({questionType}) is not fully supported yet. Please do your best to answer.
              </p>
              <Textarea
                placeholder="Type your answer here..."
                value={currentAnswer || ""}
                onChange={(e) => handleSaveAnswer(questionId, e.target.value)}
                className="min-h-[150px] resize-y"
              />
            </div>
          )
      }
    },
    [answers, handleSaveAnswer],
  )

  const currentProgress = (calculateCurrentQuestionNumber() / Math.max(totalQuestions, 1)) * 100

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Sticky header with timer */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-bold text-gray-800">{safeTestData.title || "Test"}</h1>
            {safeTestData.subject && (
              <span className="text-sm font-medium text-gray-500 ml-2 hidden md:inline">| {safeTestData.subject}</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-700">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={currentProgress} className="h-1" />
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
        <div className="space-y-6">
          {/* Test description */}
          {safeTestData.description && currentSection === 0 && currentTask === 0 && currentQuestion === 0 && (
            <Card className="border-gray-200 shadow-sm mb-6">
              <CardContent className="p-6">
                <p className="text-gray-700">{safeTestData.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Section and task information */}
          <div className="flex flex-col space-y-1">
            <h2 className="text-lg font-medium text-gray-700">
              Section {currentSection + 1}: {currentSectionData.title}
            </h2>
            <p className="text-sm text-gray-500">
              Task {currentTask + 1}: {currentTaskData.title}
            </p>
            <div className="text-xs text-gray-500">
              Question {calculateCurrentQuestionNumber()} of {totalQuestions}
            </div>
          </div>

          {/* Section instruction - show only for the first question in a section */}
          {currentTask === 0 && currentQuestion === 0 && currentSectionData.instruction && (
            <Card className="border-gray-200 bg-blue-50 border-blue-100 shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-blue-700">{currentSectionData.instruction}</p>
              </CardContent>
            </Card>
          )}

          {/* Question card */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6">{renderQuestion(currentQuestionData)}</CardContent>
          </Card>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevQuestion}
              disabled={currentSection === 0 && currentTask === 0 && currentQuestion === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
            >
              <CheckCircle className="h-4 w-4" /> Save Answer
            </Button>

            {/* Show Submit button on the last question */}
            {currentSection === sections.length - 1 &&
            currentTask === (currentSectionData.tasks?.length || 0) - 1 &&
            currentQuestion === (currentTaskData.questions?.length || 0) - 1 ? (
              <Button onClick={handleSubmitTest} className="bg-purple-600 hover:bg-purple-700">
                Submit Test
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
