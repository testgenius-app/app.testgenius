"use client"

import { useEffect, useState } from "react"
import { Users, Brain } from "lucide-react"

interface WaitingRoomProps {
  participantCount?: number
}

export default function WaitingRoom({ participantCount = 1 }: WaitingRoomProps) {
  const [dots, setDots] = useState(".")

  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "."
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Test Genius</h1>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-8 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 rounded-full bg-purple-600"></div>
              </div>
            </div>

            <h2 className="text-xl font-medium text-gray-800">Waiting for the host to start the test{dots}</h2>

            <p className="text-gray-600">Please don't close this window or navigate away</p>

            <div className="flex items-center justify-center mt-4 bg-white px-4 py-2 rounded-full shadow-sm">
              <Users className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-gray-700">
                {participantCount} {participantCount === 1 ? "participant" : "participants"} in the room
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
