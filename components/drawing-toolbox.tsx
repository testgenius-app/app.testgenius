"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Pen, Eraser, RotateCcw, RotateCw, Trash2, Eye, EyeOff, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type DrawingAction = {
  type: "path" | "erase"
  points: { x: number; y: number }[]
  color?: string
  width: number
}

type Tool = "pen" | "eraser"

export default function DrawingToolbox() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<Tool>("pen")
  const [penColor, setPenColor] = useState("#FF3B30")
  const [penWidth, setPenWidth] = useState(3)
  const [eraserWidth, setEraserWidth] = useState(20)
  const [isVisible, setIsVisible] = useState(true)
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [actions, setActions] = useState<DrawingAction[]>([])
  const [redoStack, setRedoStack] = useState<DrawingAction[]>([])
  const [currentAction, setCurrentAction] = useState<DrawingAction | null>(null)
  const [isDrawingMode, setIsDrawingMode] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const colors = [
    "#FF3B30", // Red
    "#FF9500", // Orange
    "#FFCC00", // Yellow
    "#34C759", // Green
    "#5AC8FA", // Light Blue
    "#007AFF", // Blue
    "#5856D6", // Purple
    "#AF52DE", // Pink
    "#000000", // Black
  ]

  // Initialize canvas and context
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      redrawCanvas()
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  // Redraw canvas whenever actions change or visibility changes
  useEffect(() => {
    redrawCanvas()
  }, [actions, isVisible])

  // Update cursor based on selected tool
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (isDrawingMode && isVisible) {
      if (currentTool === "pen") {
        canvas.style.cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23000000' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z'%3E%3C/path%3E%3C/svg%3E") 0 24, auto`
      } else if (currentTool === "eraser") {
        canvas.style.cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23000000' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21'%3E%3C/path%3E%3Cpath d='M22 21H7'%3E%3C/path%3E%3Cpath d='m5 11 9 9'%3E%3C/path%3E%3C/svg%3E") 0 24, auto`
      } else {
        canvas.style.cursor = "default"
      }
    } else {
      canvas.style.cursor = "default"
    }
  }, [currentTool, isDrawingMode, isVisible])

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!isVisible) return

    // Redraw all paths
    actions.forEach((action) => {
      if (action.points.length < 2) return

      ctx.beginPath()
      ctx.moveTo(action.points[0].x, action.points[0].y)

      for (let i = 1; i < action.points.length; i++) {
        ctx.lineTo(action.points[i].x, action.points[i].y)
      }

      if (action.type === "path") {
        ctx.strokeStyle = action.color || "#000000"
        ctx.lineWidth = action.width
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.stroke()
      } else if (action.type === "erase") {
        ctx.globalCompositeOperation = "destination-out"
        ctx.lineWidth = action.width
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.stroke()
        ctx.globalCompositeOperation = "source-over"
      }
    })
  }

  const startDrawing = (x: number, y: number) => {
    if (!isVisible || !isDrawingMode) return

    setIsDrawing(true)

    const newAction: DrawingAction = {
      type: currentTool === "pen" ? "path" : "erase",
      points: [{ x, y }],
      color: currentTool === "pen" ? penColor : undefined,
      width: currentTool === "pen" ? penWidth : eraserWidth,
    }

    setCurrentAction(newAction)
  }

  const draw = (x: number, y: number) => {
    if (!isDrawing || !currentAction || !isVisible || !isDrawingMode) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Add point to current action
    setCurrentAction((prev) => {
      if (!prev) return null

      const updatedAction = {
        ...prev,
        points: [...prev.points, { x, y }],
      }

      // Draw the latest segment
      const points = updatedAction.points
      const lastIndex = points.length - 1

      if (lastIndex > 0) {
        ctx.beginPath()
        ctx.moveTo(points[lastIndex - 1].x, points[lastIndex - 1].y)
        ctx.lineTo(points[lastIndex].x, points[lastIndex].y)

        if (updatedAction.type === "path") {
          ctx.strokeStyle = updatedAction.color || "#000000"
          ctx.lineWidth = updatedAction.width
          ctx.lineCap = "round"
          ctx.lineJoin = "round"
          ctx.stroke()
        } else if (updatedAction.type === "erase") {
          ctx.globalCompositeOperation = "destination-out"
          ctx.lineWidth = updatedAction.width
          ctx.lineCap = "round"
          ctx.lineJoin = "round"
          ctx.stroke()
          ctx.globalCompositeOperation = "source-over"
        }
      }

      return updatedAction
    })
  }

  const endDrawing = () => {
    if (!isDrawing || !currentAction) return

    setIsDrawing(false)

    // Add the completed action to history
    setActions((prev) => [...prev, currentAction])
    setRedoStack([]) // Clear redo stack when new action is completed
    setCurrentAction(null)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left mouse button only
      e.preventDefault()
      const { clientX, clientY } = e
      startDrawing(clientX, clientY)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault()
    const { clientX, clientY } = e
    draw(clientX, clientY)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault()
    endDrawing()
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.preventDefault()
    endDrawing()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      startDrawing(touch.clientX, touch.clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      draw(touch.clientX, touch.clientY)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    endDrawing()
  }

  const handleUndo = () => {
    if (actions.length === 0) return

    const lastAction = actions[actions.length - 1]
    setActions(actions.slice(0, -1))
    setRedoStack([...redoStack, lastAction])
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return

    const actionToRedo = redoStack[redoStack.length - 1]
    setRedoStack(redoStack.slice(0, -1))
    setActions([...actions, actionToRedo])
  }

  const handleClearAll = () => {
    setShowConfirmClear(true)
  }

  const confirmClearAll = () => {
    setActions([])
    setRedoStack([])
    setShowConfirmClear(false)
  }

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  const toggleToolbox = () => {
    setIsOpen(!isOpen)
  }

  const setTool = (tool: Tool) => {
    setCurrentTool(tool)
    setIsDrawingMode(true)
  }

  return (
    <>
      {/* Canvas overlay */}
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 z-40 ${isVisible && isDrawingMode ? "" : "pointer-events-none"}`}
        style={{
          touchAction: "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Toolbox */}
      <div ref={containerRef} className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
        {/* Toggle button */}
        <Button
          variant="default"
          size="icon"
          className="h-12 w-12 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg mb-2"
          onClick={toggleToolbox}
        >
          {isOpen ? <ChevronDown className="h-6 w-6" /> : <Pen className="h-6 w-6" />}
        </Button>

        {/* Toolbox panel */}
        {isOpen && (
          <div className="bg-white rounded-xl shadow-lg p-3 mb-2 flex flex-col gap-2 border border-gray-200 w-[280px]">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium text-gray-700">Drawing Tools</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-500 hover:text-gray-700"
                onClick={toggleToolbox}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Tool selection */}
            <div className="flex gap-2 mb-2">
              <Button
                variant={currentTool === "pen" && isDrawingMode ? "default" : "outline"}
                size="sm"
                className={`flex-1 ${currentTool === "pen" && isDrawingMode ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                onClick={() => setTool("pen")}
              >
                <Pen className="h-4 w-4 mr-2" />
                Pen
              </Button>
              <Button
                variant={currentTool === "eraser" && isDrawingMode ? "default" : "outline"}
                size="sm"
                className={`flex-1 ${currentTool === "eraser" && isDrawingMode ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                onClick={() => setTool("eraser")}
              >
                <Eraser className="h-4 w-4 mr-2" />
                Eraser
              </Button>
            </div>

            {/* Drawing mode toggle */}
            <div className="flex items-center mb-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDrawingMode}
                  onChange={() => setIsDrawingMode(!isDrawingMode)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">Drawing Mode</span>
              </label>
            </div>

            {/* Color selection */}
            {currentTool === "pen" && (
              <div className="mb-2">
                <div className="flex flex-wrap gap-2 justify-center">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full transition-all ${
                        penColor === color ? "ring-2 ring-offset-2 ring-gray-400" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setPenColor(color)}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Width selection */}
            <div className="mb-2">
              <label className="text-xs text-gray-500 mb-1 block">
                {currentTool === "pen" ? "Pen Width" : "Eraser Size"}
              </label>
              <input
                type="range"
                min="1"
                max={currentTool === "pen" ? "10" : "50"}
                value={currentTool === "pen" ? penWidth : eraserWidth}
                onChange={(e) =>
                  currentTool === "pen"
                    ? setPenWidth(Number.parseInt(e.target.value))
                    : setEraserWidth(Number.parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-full"
                onClick={handleUndo}
                disabled={actions.length === 0}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-full"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-full" onClick={toggleVisibility}>
                {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleClearAll}
                disabled={actions.length === 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Clear confirmation dialog */}
      <AlertDialog open={showConfirmClear} onOpenChange={setShowConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all drawings?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All your drawings will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearAll} className="bg-red-500 hover:bg-red-600">
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
