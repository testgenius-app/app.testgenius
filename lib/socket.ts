import { io } from "socket.io-client"

// Create a singleton socket instance
let socket: any

export function getSocket() {
  if (!socket) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

    socket = io(`${API_URL}/online-test`, {
      transports: ["websocket"],
      autoConnect: false,
    })

    // Add connection status logging
    socket.on("connect", () => {
      console.log("Socket connected successfully")
    })

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })
  }
  return socket
}
