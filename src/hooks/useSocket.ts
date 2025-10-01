'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export type ClientSocket = Socket;

export const useSocket = (userId: string) => {
  const [socket, setSocket] = useState<ClientSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Same-origin connection; target Next.js app route at /api/socket
    const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      withCredentials: false,
    });

    const onConnect = () => {
      setIsConnected(true);
      socketInstance.emit('join-room', userId);
    };
    const onDisconnect = () => setIsConnected(false);
    const onError = () => setIsConnected(false);

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('connect_error', onError);

    setSocket(socketInstance);

    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.off('connect_error', onError);
      socketInstance.disconnect();
    };
  }, [userId]);

  return { socket, isConnected };
};
