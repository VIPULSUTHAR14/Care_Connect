'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

// 1. FIX: Define a specific interface for the incoming message data
interface NewMessageData {
  sender: string;
  message: string;
}

export default function SocketTestPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  // Note: Using Date.now() for a user ID is only for simple testing.
  // In a real app, you would use a proper user ID from a session.
  const [userId] = useState('test_user_' + 'to' + Date.now());
  const { socket, isConnected } = useSocket(userId);

  useEffect(() => {
    if (!socket) return;

    // 2. FIX: Apply the specific interface instead of 'any'
    socket.on('new-message', (data: NewMessageData) => {
      setMessages(prev => [...prev, `${data.sender}: ${data.message}`]);
    });

    socket.on('user-typing', (data: { isTyping: boolean }) => {
      console.log('User typing status:', data.isTyping);
    });

    // Cleanup listeners on component unmount
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
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              Status: {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="space-y-2 mb-4 h-64 overflow-y-auto border p-2 rounded-md">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center pt-24">No messages yet.</p>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded text-gray-800">
                  {message}
                </div>
              ))
            )}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={!isConnected}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || !isConnected}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
            <li>Open this page in multiple browser tabs or windows.</li>
            <li>Send messages from one tab and see them appear in real-time in the others.</li>
            <li>The connection status indicator shows if the real-time connection is active.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}