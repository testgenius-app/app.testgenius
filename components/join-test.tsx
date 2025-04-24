"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowRight, Brain } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSocket } from "@/lib/socket"
import { ONLINE_TEST_EVENTS } from "@/lib/socket-events"
import LoadingSpinner from "./loading-spinner"
import WaitingRoom from "./waiting-room"
import TestTakingPage from "./test-taking-page"
import UserInfoForm from "./user-info-form"

// Define the test data structure based on the backend payload
interface TestPayload {
  test: {
    id: string
    testId: string
    tempCodeId: string
    durationInMinutes: number
    test: {
      id: string
      title: string
      subject: string
      description: string
      sections?: Array<{
        id: string
        title: string
        instruction: string
        tasks?: Array<{
          id: string
          title: string
          questions?: Array<{
            id: string
            questionText: string
            options: string[]
            answers: string[]
            explanation: string
            [key: string]: any
          }>
          [key: string]: any
        }>
        [key: string]: any
      }>
      [key: string]: any
    }
  }
}

export default function JoinTest() {
  const [testCode, setTestCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [joinedTest, setJoinedTest] = useState(false)
  const [testStarted, setTestStarted] = useState(false)
  const [testData, setTestData] = useState<any>(null)
  const [participantCount, setParticipantCount] = useState(1)
  const [showUserForm, setShowUserForm] = useState(false)
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })

  const socket = useRef(getSocket())
  // Initialize socket connection and event listeners
  useEffect(() => {
    const socketInstance = socket.current

    // Set up event listeners
    socketInstance.on("connect", () => {
      console.log("Socket connected successfully")
      setConnectionStatus("connected")
      setError(null)
    })

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err)
      setConnectionStatus("disconnected")
      setError("Failed to connect to the server. Please try again.")
      setIsLoading(false)
    })

    socketInstance.on(ONLINE_TEST_EVENTS.ERROR, (errorMsg) => {
      console.error("Socket error event:", errorMsg)
      setError(errorMsg)
      setIsLoading(false)
    })

    socketInstance.on("participant_count", (count) => {
      setParticipantCount(count)
    })

    socketInstance.on(ONLINE_TEST_EVENTS.START_ONLINE_TEST, (payload: TestPayload) => {
      console.log("Received test data:", payload)

      // Extract the relevant data from the payload
      const { test } = payload
      const { id, testId, tempCodeId, durationInMinutes } = test
      const testInfo = test.test // The nested test object with title, subject, etc.

      // Process sections and questions to match our expected format
      const processedSections =
        testInfo.sections?.map((section) => {
          return {
            id: section.id,
            title: section.title,
            instruction: section.instruction,
            tasks:
              section.tasks?.map((task) => {
                return {
                  id: task.id,
                  title: task.title,
                  questions:
                    task.questions?.map((question) => {
                      return {
                        id: question.id,
                        text: question.questionText,
                        options: question.options || [],
                        type: task.type || section.type || "multiple_choice",
                        correctAnswer: question.answers?.[0] || "",
                        explanation: question.explanation || "",
                      }
                    }) || [],
                }
              }) || [],
          }
        }) || []

      // Format the data for our components
      const formattedTestData = {
        id: id,
        testId: testId,
        code: tempCodeId,
        durationInMinutes: durationInMinutes,
        title: testInfo.title,
        subject: testInfo.subject,
        description: testInfo.description,
        sections: processedSections,
      }

      console.log("Formatted test data:", formattedTestData)
      setTestData(formattedTestData)
      setTestStarted(true)
    })

    // Clean up on unmount
    return () => {
      socketInstance.off("connect")
      socketInstance.off("connect_error")
      socketInstance.off(ONLINE_TEST_EVENTS.ERROR)
      socketInstance.off("participant_count")
      socketInstance.off(ONLINE_TEST_EVENTS.START_ONLINE_TEST)
    }
  }, [])

  // Handle browser back button and refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (joinedTest) {
        e.preventDefault()
        e.returnValue = "Are you sure you want to leave? Your test progress will be lost."
        return e.returnValue
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      if (joinedTest) {
        e.preventDefault()
        window.history.pushState(null, "", window.location.pathname)
        setError("Please do not use the back button during a test.")
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("popstate", handlePopState)

    // Push a new state to prevent going back
    if (joinedTest) {
      window.history.pushState(null, "", window.location.pathname)
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [joinedTest])

  // Handle input change with validation
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
    setTestCode(value)
    setError(null)
  }, [])

  // Validate test code
  const isValidCode = testCode.length === 6

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleJoinTest()
    }
  }

  // Handle join test
  const handleJoinTest = useCallback(() => {
    if (!isValidCode) {
      setError("Please enter a valid 6-digit code.")
      return
    }

    setIsLoading(true)

    // Connect to socket if not already connected
    if (connectionStatus !== "connected") {
      setConnectionStatus("connecting")
      socket.current.connect()
    }

    // Emit join event
    socket.current.emit(ONLINE_TEST_EVENTS.JOIN_ONLINE_TEST, {
      code: Number(testCode),
    })

    // Listen for successful join
    const handleJoinSuccess = () => {
      setIsLoading(false)
      setShowUserForm(true)
      socket.current.off("join_success", handleJoinSuccess)
    }

    // Listen for join error
    const handleJoinError = (error: string) => {
      setIsLoading(false)
      setError(error)
      socket.current.off("join_error", handleJoinError)
    }

    socket.current.on("join_success", handleJoinSuccess)
    socket.current.on("join_error", handleJoinError)

    // For demo purposes, simulate a successful join after a delay
    setTimeout(() => {
      setIsLoading(false)
      setShowUserForm(true)
    }, 1500)
  }, [isValidCode, connectionStatus, testCode])

  // Handle user info submission
  const handleUserInfoSubmit = useCallback(
    (userData: { firstName: string; lastName: string; email: string }) => {
      setUserData(userData)

      // Emit user data change event with the test code included
      socket.current.emit(ONLINE_TEST_EVENTS.CHANGE_USER_DATA, {
        ...userData,
        code: Number(testCode),
      })

      // Set joined test to true
      setJoinedTest(true)
    },
    [testCode],
  )

  // Render loading spinner when joining
  if (isLoading) {
    return <LoadingSpinner message="Connecting to test..." />
  }

  // Render user info form after successful join
  if (showUserForm && !joinedTest) {
    return <UserInfoForm onSubmit={handleUserInfoSubmit} />
  }

  // Render waiting room when joined but not started and no test info yet
  if (joinedTest && !testStarted) {
    return <WaitingRoom participantCount={participantCount} />
  }

  // Render test taking page when test has started
  if (testStarted && testData) {
    return <TestTakingPage testData={testData} socket={socket.current} />
  }

  // Render join test page
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Test Genius</h1>
          </div>
          <p className="text-gray-600">Enter your test code to begin</p>
        </div>

        <Card className="border-gray-200 shadow-md rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 pb-6">
            <CardTitle className="text-xl font-medium text-gray-800 text-center">Join a Test</CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="test-code" className="text-sm font-medium text-gray-700">
                Enter 6-Digit Test Code
              </label>
              <Input
                id="test-code"
                placeholder="e.g., 843917"
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="rounded-lg border-gray-300 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-center text-lg tracking-wider"
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
          </CardContent>

          <CardFooter className="bg-gray-50 p-6 flex justify-center border-t border-gray-100">
            <Button
              onClick={handleJoinTest}
              disabled={!isValidCode}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2.5 h-auto text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Test <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
