import { NextRequest } from "next/server";
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

// Keep a global reference so we don’t reinitialize on hot reload
const globalForSocket = global as unknown as { io?: SocketIOServer };

export async function GET(req: NextRequest) {
  if (!globalForSocket.io) {
    console.log("Starting Socket.IO server...");

    // @ts-ignore - req is actually IncomingMessage here
    const server: HTTPServer = (req as any).socket?.server;

    // @ts-expect-error - server may not have 'io' property, but we attach it dynamically
    if (!server.io) {
      const io = new SocketIOServer(server, {
        path: "/api/socket",
        cors: { origin: "*" },
      });

      // Attach to server so it persists
      // @ts-expect-error - dynamically adding 'io' property to server
      server.io = io;
      globalForSocket.io = io;

      io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // User joins a room named by their userId for targeted messaging
        socket.on("join-room", (userId: string) => {
          if (typeof userId === "string" && userId.trim().length > 0) {
            socket.join(userId);
            console.log(`Socket ${socket.id} joined room ${userId}`);
          }
        });

        // Handle call requests (target callee room)
        socket.on("call:request", ({ callId, callerId, calleeId }) => {
          console.log(`Call request from ${callerId} to ${calleeId}`);
          io.to(calleeId).emit("call:incoming", { callId, callerId, calleeId });
        });

        // Call accepted (notify caller)
        socket.on("call:accept", ({ callId, calleeId, callerId }) => {
          io.to(callerId).emit("call:accepted", { callId, calleeId });
        });

        // Call rejected (notify caller)
        socket.on("call:reject", ({ callId, callerId }) => {
          io.to(callerId).emit("call:rejected", { callId });
        });

        // WebRTC signaling (target peer user room specified in 'to')
        socket.on("webrtc:offer", (data) => {
          io.to(data.to).emit("webrtc:offer", data);
        });

        socket.on("webrtc:answer", (data) => {
          io.to(data.to).emit("webrtc:answer", data);
        });

        socket.on("webrtc:candidate", (data) => {
          io.to(data.to).emit("webrtc:candidate", data);
        });

        socket.on("disconnect", () => {
          console.log("User disconnected:", socket.id);
        });
      });
    }
  }

  return new Response("Socket.IO server running", { status: 200 });
}
