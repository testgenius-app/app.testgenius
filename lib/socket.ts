import { io } from "socket.io-client"

// Create a singleton socket instance
let socket: any

export function getSocket() {
  if (!socket) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

    socket = io(`${API_URL}/online-test`, {
      transports: ["websocket", "polling"],
      autoConnect: false,
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    // Add connection status logging
    socket.on("connect", () => {
      console.log("Socket connected successfully to:", API_URL)
    })

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
    })

    socket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts")
    })
  }
  return socket
}
