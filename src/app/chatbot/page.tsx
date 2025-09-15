'use client';

import { useState, useEffect, useRef } from 'react';
import { Send as SendIcon, Bot as BotIcon, User as UserIcon } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

interface Message {
  _id?: string;
  userId: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userId] = useState('user_' + Date.now()); // Simple user ID generation
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useSocket(userId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch(`/api/messages?userId=${userId}`);
        const data = await response.json();

        if (data.success) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();
  }, [userId]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      setIsLoading(false);
    });

    // Listen for typing indicators
    socket.on('user-typing', (data: { isTyping: boolean }) => {
      setIsTyping(data.isTyping);
    });

    // Listen for errors
    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
      setIsLoading(false);
    });

    // Cleanup listeners
    return () => {
      socket.off('new-message');
      socket.off('user-typing');
      socket.off('error');
    };
  }, [socket]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading || !socket || !isConnected) return;

    const userMessage: Message = {
      userId,
      message: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Send message via Socket.IO
    socket.emit('send-message', {
      userId,
      message: inputMessage,
    });
  };

  // Handle typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (socket && isConnected) {
      if (e.target.value.trim()) {
        socket.emit('typing-start', { userId, isTyping: true });
      } else {
        socket.emit('typing-stop', { userId, isTyping: false });
      }
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to render a single message
  function renderMessage(message: Message, index: number) {
    return (
      <div
        key={index}
        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`flex items-start space-x-2 max-w-[80%] ${
            message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
          }`}
        >
          {/* Avatar */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.sender === 'user'
                ? 'bg-green-950'
                : 'bg-gray-200'
            }`}
          >
            {message.sender === 'user' ? (
              <UserIcon className="w-4 h-4 text-white" />
            ) : (
              <BotIcon className="w-4 h-4 text-green-950" />
            )}
          </div>

          {/* Message Bubble */}
          <div
            className={`px-4 py-2 rounded-lg font-mono ${
              message.sender === 'user'
                ? 'bg-gray-200 text-green-500'
                : 'bg-gray-100 text-green-950'
            }`}
          >
            <p className={`text-sm whitespace-pre-wrap font-mono ${message.sender === 'user' ? 'text-green-500' : 'text-green-950'}`}>{message.message}</p>
            <p
              className={`text-xs mt-1 font-mono ${
                message.sender === 'user' ? 'text-green-400' : 'text-green-700'
              }`}
            >
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col font-mono text-green-950">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-950 rounded-full flex items-center justify-center">
              <BotIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-mono text-green-950">Healthcare Assistant</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-mono text-green-700">Ask me anything about your health</p>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs font-mono text-green-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="flex-1 flex flex-row items-center justify-center w-full h-full">
        {/* Chat History Sidebar */}
          {/* <div className="hidden md:flex flex-col w-[30vw] h-full bg-white border-r shadow-sm">
            <div className="flex items-center justify-center py-4 border-b">
              <span className="text-lg font-bold font-mono text-green-950">Chat History</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BotIcon className="w-12 h-12 text-green-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold font-mono text-green-950 mb-2">No chat history yet</h3>
                    <p className="text-green-700 font-mono">Start a conversation to see your messages here.</p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' ? 'bg-green-950' : 'bg-gray-200'
                    }`}>
                      {message.sender === 'user' ? (
                        <UserIcon className="w-3 h-3 text-white" />
                      ) : (
                        <BotIcon className="w-3 h-3 text-green-950" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-mono text-green-950">{message.message}</p>
                      <p className="text-xs font-mono text-green-700">{formatTime(message.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div> */}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full h-full" style={{ width: '60vw', minWidth: '60vw', maxWidth: '60vw' }}>
          <div className="flex-1 w-full flex flex-col justify-between bg-white rounded-none md:rounded-lg shadow-none md:shadow-sm border-x-0 md:border h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-green-950">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BotIcon className="w-12 h-12 text-green-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold font-mono text-green-950 mb-2">Welcome to Healthcare Assistant</h3>
                    <p className="text-green-700 font-mono">Start a conversation by typing your health-related questions below.</p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => renderMessage(message, index))
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <BotIcon className="w-4 h-4 text-green-950" />
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg font-mono">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <BotIcon className="w-4 h-4 text-green-950" />
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg font-mono">
                      <p className="text-sm text-green-700 italic font-mono">Bot is typing...</p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4 bg-white">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={handleInputChange}
                  placeholder="Type your health question here..."
                  className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent font-mono text-base text-green-950"
                  disabled={isLoading || !isConnected}
                  autoFocus
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading || !isConnected}
                  className="px-4 py-2 bg-gray-200 text-green-500 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-mono"
                >
                  <SendIcon className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
