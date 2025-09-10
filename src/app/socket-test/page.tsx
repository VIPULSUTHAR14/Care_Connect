'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

export default function SocketTestPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userId] = useState('test_user_' + Date.now());
  const { socket, isConnected } = useSocket(userId);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-message', (data: any) => {
      setMessages(prev => [...prev, `${data.sender}: ${data.message}`]);
    });

    socket.on('user-typing', (data: { isTyping: boolean }) => {
      console.log('User typing:', data.isTyping);
    });

    return () => {
      socket.off('new-message');
      socket.off('user-typing');
    };
  }, [socket]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !socket || !isConnected) return;

    socket.emit('send-message', {
      userId,
      message: inputMessage,
    });

    setInputMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Socket.IO Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              Status: {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {messages.map((message, index) => (
              <div key={index} className="p-2 bg-gray-100 rounded">
                {message}
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded"
              disabled={!isConnected}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || !isConnected}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Open this page in multiple browser tabs/windows</li>
            <li>• Send messages from one tab and see them appear in real-time in other tabs</li>
            <li>• The connection status indicator shows if Socket.IO is working</li>
            <li>• Messages are sent via WebSocket for real-time communication</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
