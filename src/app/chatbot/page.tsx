'use client';

import { useState, useEffect, useRef } from 'react';
import { Send as SendIcon, Bot as BotIcon, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { stat } from 'fs';


// Defines the structure for a chat message
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
  const [userId] = useState('user_' + Date.now()); // Simple unique ID for the session
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const router = useRouter()
  const {data:session , status} = useSession()

  useEffect(()=>{
   if(status==="unauthenticated"){
    router.push("/auth/signin")
   }
  },[session ,status])

  // Automatically scrolls to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from the backend when the component first loads
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch(`/api/messages?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch chat history');
        }
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

  // Handles sending a new message to the backend
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      userId,
      message: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    // Optimistically update the UI with the user's message
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Use fetch to call your POST API endpoint
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          message: inputMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage: Message = {
          userId,
          message: data.botResponse,
          sender: 'bot',
          timestamp: new Date(),
        };
        // Add the bot's response to the UI
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.error || 'API returned an error');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        userId,
        message: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Formats the timestamp for display
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Renders a single message bubble
  function renderMessage(message: Message, index: number) {
    const isUser = message.sender === 'user';
    return (
      <div
        key={index}
        className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-2`}
      >
        <div className={`flex items-end ${isUser ? 'flex-row-reverse' : ''} max-w-[80%]`}>
          {/* Avatar */}
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-cyan-800' : 'bg-gray-200'} border border-cyan-200`}
          >
            {isUser ? (
              <UserIcon className="w-5 h-5 text-white" />
            ) : (
              <BotIcon className="w-5 h-5 text-cyan-800" />
            )}
          </div>
          {/* Message Bubble */}
          <div
            className={`ml-2 mr-2 px-4 py-2 rounded-2xl shadow-sm font-mono text-base break-words ${
              isUser
                ? 'bg-cyan-800 text-white rounded-br-none'
                : 'bg-white text-cyan-900 rounded-bl-none border border-cyan-100'
            }`}
          >
            <span className="block">{message.message}</span>
            <span className={`block text-xs mt-1 ${isUser ? 'text-cyan-200' : 'text-cyan-500'}`}>
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-gray-100 flex flex-col font-mono text-cyan-900">
      {/* Header
      <div className="bg-white shadow border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-4">
          <div className="w-12 h-12 bg-cyan-800 rounded-full flex items-center justify-center shadow">
            <BotIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-mono text-cyan-900">Healthcare Assistant</h1>
            <p className="text-base font-mono text-cyan-700">Ask me anything about your health</p>
          </div>
        </div>
      </div> */}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-4xl flex flex-col flex-1 justify-between bg-white/80 rounded-none md:rounded-2xl shadow-lg border border-cyan-100 my-6 h-[70vh]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 font-mono text-cyan-900">
            {messages.length === 0 && !isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BotIcon className="w-16 h-16 text-cyan-200 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold font-mono text-cyan-900 mb-3">Welcome to Healthcare Assistant</h3>
                  <p className="text-cyan-700 font-mono text-lg">Start a conversation by typing your health-related questions below.</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => renderMessage(message, index))
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex w-full justify-start mb-2">
                <div className="flex items-end max-w-[80%]">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 border border-cyan-200">
                    <BotIcon className="w-5 h-5 text-cyan-800" />
                  </div>
                  <div className="ml-2 px-4 py-2 rounded-2xl bg-white border border-cyan-100 shadow-sm font-mono">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className=" bg-white/90 px-4 py-4 rounded-b-2xl">
            <form onSubmit={sendMessage} className="flex items-center space-x-2 p-5 border border-cyan-800 rounded-full">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your health question here..."
                className="flex-1 px-4 py-3 border border-cyan-200 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-base text-cyan-900 bg-white shadow-sm"
                disabled={isLoading}
                autoFocus
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-3 bg-cyan-800 text-white rounded-full hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-mono text-base font-bold transition"
              >
                <SendIcon className="w-5 h-5 mr-1" />
                <span className="text-xl hover:underline"  >Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}