"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowRight, Brain } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserInfoFormProps {
  onSubmit: (userData: { firstName: string; lastName: string; email: string }) => void
}

export default function UserInfoForm({ onSubmit }: UserInfoFormProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim()) {
      setError("Please enter your first name.")
      return
    }

    if (!lastName.trim()) {
      setError("Please enter your last name.")
      return
    }

    // Email validation is optional, but if provided, it should be valid
    if (email && !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }

    onSubmit({ firstName, lastName, email })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Test Genius</h1>
          </div>
          <p className="text-gray-600">Please enter your information to join the test</p>
        </div>

        <Card className="border-gray-200 shadow-md rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 pb-6">
            <CardTitle className="text-xl font-medium text-gray-800 text-center">Your Information</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="rounded-lg mt-1"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="rounded-lg mt-1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email (Optional)
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg mt-1"
                    placeholder="your@email.com"
                  />
                </div>
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
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2.5 h-auto text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                Join Test <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
