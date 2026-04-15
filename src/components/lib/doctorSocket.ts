// Stub for doctorSocket — replace with real socket.io-client implementation when ready.
import { io, Socket } from "socket.io-client";

let doctorSocket: Socket | null = null;

export function connectDoctorSocket(doctorId: string, authToken: string): Socket {
  if (doctorSocket?.connected) return doctorSocket;
  doctorSocket = io({
    path: "/api/socket/",
    auth: { token: authToken, userId: doctorId, userType: "doctor" },
    transports: ["polling", "websocket"],
    autoConnect: true,
    timeout: 20000,
    forceNew: true,
  });
  return doctorSocket;
}

export function disconnectDoctorSocket(): void {
  if (doctorSocket) {
    doctorSocket.disconnect();
    doctorSocket = null;
  }
}
