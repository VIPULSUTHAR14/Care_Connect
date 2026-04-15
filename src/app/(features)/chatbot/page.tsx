'use client';

import { useState, useEffect, useRef } from 'react';
import { Send as SendIcon, Bot as BotIcon, User as UserIcon, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from "react-toastify";

// Defines the structure for a chat message
interface Message {
    _id?: string;
    userId: string;
    message: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth', // for smooth scrolling
    });
  };

export default function ChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    
    const router = useRouter();
    const { data: session, status } = useSession();
    const userId = session?.user?.id;

    // Redirect unauthenticated users
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push("/auth/signin");
        }
    }, [status, router]);

    // Automatically scroll to the latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    // Load chat history
    useEffect(() => {
        const loadChatHistory = async () => {
            if (!userId) return;

            setIsHistoryLoading(true);
            try {
                const response = await fetch(`/api/messages?userId=${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch chat history');
                }
                const data = await response.json();
                if (data.success) {
                    setMessages(data.messages);
                }
            } catch (error: unknown) { // 1. FIX: Use 'unknown' for type safety
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                toast.error(`Error loading chat history: ${errorMessage}`);
            } finally {
                setIsHistoryLoading(false);
            }
        };

        if (status === 'authenticated') {
            loadChatHistory();
        }
    }, [status, userId]);

    // Handle sending a new message
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading || !userId) return;

        const userMessage: Message = {
            userId,
            message: inputMessage,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputMessage;
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId, message: currentInput }),
            });
            const data = await response.json();

            if (data.success) {
                const botMessage: Message = {
                    userId,
                    message: data.botResponse,
                    sender: 'bot',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error(data.error || 'API returned an error');
            }
        } catch (error: unknown) { // 2. FIX: Use 'unknown' for type safety
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast.error(`Failed to send message: ${errorMessage}`);
            
            const errorBotMessage: Message = {
                userId,
                message: "Sorry, I'm having trouble connecting. Please try again later.",
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorBotMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Render a single message bubble
    function renderMessage(message: Message, index: number) {
        const isUser = message.sender === 'user';
        return (
            <div key={index} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 border border-cyan-200">
                        <BotIcon className="h-5 w-5 text-cyan-800" />
                    </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[80%] ${isUser ? 'rounded-br-none bg-cyan-800 text-white' : 'rounded-bl-none border border-cyan-100 bg-white text-cyan-900'}`}>
                    <p className="block" style={{ whiteSpace: 'pre-wrap' }}>{message.message}</p>
                    <span className={`mt-1 block text-right text-xs ${isUser ? 'text-cyan-200' : 'text-cyan-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                {isUser && (
                     <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-cyan-800 border border-cyan-200">
                        <UserIcon className="h-5 w-5 text-white" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-gray-50 font-mono text-cyan-900">
            <div className="flex-1 overflow-hidden">
                <div className="mx-auto flex h-full w-full max-w-4xl flex-col bg-white/80 shadow-lg md:my-6 md:rounded-2xl">
                    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 font-mono text-cyan-900 md:px-6">
                        {isHistoryLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <LoaderCircle className="h-8 w-8 animate-spin text-cyan-800" />
                                <p className="ml-3 text-lg">Loading chat history...</p>
                            </div>
                        ) : messages.length > 0 ? (
                            messages.map((message, index) => renderMessage(message, index))
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center text-center">
                                <BotIcon className="h-16 w-16 text-cyan-700" />
                                <h2 className="mt-4 text-2xl font-semibold text-cyan-800">Chatbot Assistant</h2>
                                <p className="mt-2 text-cyan-600">Ask me anything about your health</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="rounded-b-2xl border-t border-cyan-100 bg-white/90 px-4 py-3 sticky bottom-0">
                        <form onSubmit={sendMessage} className="flex items-center space-x-3">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder={status === 'authenticated' ? "Ask a health question..." : "Authenticating..."}
                                className="flex-1 rounded-full border border-cyan-200 bg-white px-5 py-3 font-mono text-sm text-cyan-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-base"
                                disabled={isLoading || status !== 'authenticated'}
                                autoFocus
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isLoading || status !== 'authenticated'}
                                
                                
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-800 font-bold text-white transition hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <SendIcon onClick={()=>scrollToBottom()} className="h-5 w-5" />
                                <span className="sr-only">Send</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}