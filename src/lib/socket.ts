import { io, Socket } from "socket.io-client";

export type ClientSocket = Socket;

export function connectSocket(token?: string): ClientSocket {
	return io("", {
		path: "/api/socket",
		transports: ["websocket", "polling"],
		autoConnect: true,
		reconnection: true,
		reconnectionAttempts: 10,
		reconnectionDelay: 1000,
		withCredentials: false, // don't send cookies; avoid NextAuth session interference
		auth: token ? { token } : undefined,
	});
}
