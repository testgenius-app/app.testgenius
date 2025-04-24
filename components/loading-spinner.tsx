import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  message?: string
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center p-8 rounded-xl">
        <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-700 font-medium text-lg">{message}</p>
      </div>
    </div>
  )
}
