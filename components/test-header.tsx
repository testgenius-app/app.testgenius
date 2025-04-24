import { LogOut, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TestHeaderProps {
  timeLeft: string
}

export default function TestHeader({ timeLeft }: TestHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-purple-600">Test Genius</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full">
            <Clock className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-purple-700">{timeLeft}</span>
          </div>

          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            <LogOut className="h-4 w-4 mr-2" />
            Exit
          </Button>
        </div>
      </div>
    </header>
  )
}
