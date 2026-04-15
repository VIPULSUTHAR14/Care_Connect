'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { connectSocket, ClientSocket } from '@/lib/socket';
import { User } from 'next-auth';

interface SocketContextValue {
	socket: ClientSocket | null;
	isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, isConnected: false });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { data: session, status } = useSession();
	const [socket, setSocket] = useState<ClientSocket | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		if (status === 'loading') return;

		// --- Fix for "WebSocket is closed before the connection is established" ---
		// Only create socket if window is defined (client-side) and user is authenticated
		if (typeof window === 'undefined' || status !== 'authenticated') {
			if (socket) {
				socket.disconnect();
				setSocket(null);
				setIsConnected(false);
			}
			return;
		}

		// Optional: pass a token if you use it server-side; otherwise omit
		const token = undefined;
		const s = connectSocket(token);

		setSocket(s);

		const handleConnect = () => setIsConnected(true);
		const handleDisconnect = () => setIsConnected(false);

		s.on('connect', handleConnect);
		s.on('disconnect', handleDisconnect);

		// Join personal room when authenticated and have a user id
		const userId = (session?.user as User)?.id as string | undefined;
		if (userId) {
			const join = () => s.emit('join-room', userId);
			if (s.connected) join(); else s.once('connect', join);
		}

		return () => {
			s.off('connect', handleConnect);
			s.off('disconnect', handleDisconnect);
			s.disconnect();
			setSocket(null);
			setIsConnected(false);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, session?.user]);

	const value = useMemo<SocketContextValue>(() => ({ socket, isConnected }), [socket, isConnected]);
	return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => useContext(SocketContext);
