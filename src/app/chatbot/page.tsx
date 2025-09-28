'use client';

import { useState, useEffect, useRef } from 'react';
import { Send as SendIcon, Bot as BotIcon, User as UserIcon, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {toast} from "react-toastify"

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
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const router = useRouter();
    const { data: session, status } = useSession();

    // CRITICAL FIX: Use the authenticated user's ID for persistent chat history.
    // This can be the user's database ID, email, or any unique identifier from the session.
    const userId = session?.user?.id; // Adjust 'id' if your session user object uses a different key (e.g., email)

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

    // Load chat history from the backend when the user is authenticated
    useEffect(() => {
        const loadChatHistory = async () => {
            if (!userId) return; // Don't fetch if there's no userId

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
            } catch (error : any) {
                toast.error('Error loading chat history:', error);
            } finally {
                setIsHistoryLoading(false);
            }
        };

        if (status === 'authenticated') {
            loadChatHistory();
        }
    }, [status, userId]); // Re-run if status or userId changes

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
        const currentInput = inputMessage; // Store current input before clearing
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
        } catch (error : any) {
            toast.error('Failed to send message:', error);
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

    // Render a single message bubble
    function renderMessage(message: Message, index: number) {
        const isUser = message.sender === 'user';
        return (
            <div key={index} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
                <div className={`flex items-end ${isUser ? 'flex-row-reverse' : ''} max-w-[80%]`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-cyan-800' : 'bg-gray-200'} border border-cyan-200`}>
                        {isUser ? <UserIcon className="w-5 h-5 text-white" /> : <BotIcon className="w-5 h-5 text-cyan-800" />}
                    </div>
                    <div className={`ml-2 mr-2 px-4 py-2 rounded-2xl shadow-sm font-mono text-base break-words ${isUser ? 'bg-cyan-800 text-white rounded-br-none' : 'bg-white text-cyan-900 rounded-bl-none border border-cyan-100'}`}>
                        <span className="block" style={{ whiteSpace: 'pre-wrap' }}>{message.message}</span>
                        <span className={`block text-xs mt-1 ${isUser ? 'text-cyan-200' : 'text-cyan-500'}`}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[90vh] bg-gray-100 flex flex-col font-mono text-cyan-900">
            <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="w-full max-w-4xl flex flex-col flex-1 bg-white/80 rounded-none md:rounded-2xl shadow-lg border border-cyan-100 my-6 h-[70vh]">
                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 font-mono text-cyan-900">
                        {/* CRITICAL FIX: Render dynamic messages from state, not a static array */}
                        {isHistoryLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <LoaderCircle className="w-8 h-8 text-cyan-800 animate-spin" />
                                <p className="ml-2">Loading history...</p>
                            </div>
                        ) : (
                            messages.map((message, index) => renderMessage(message, index))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="bg-white/90 px-4 py-4 rounded-b-2xl">
                        <form onSubmit={sendMessage} className="flex items-center space-x-2 p-5 border border-cyan-800 rounded-full">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder={status === 'authenticated' ? "Type your health question here..." : "Authenticating..."}
                                className="flex-1 px-4 py-3 border border-cyan-200 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-base text-cyan-900 bg-white shadow-sm"
                                disabled={isLoading || status !== 'authenticated'}
                                autoFocus
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isLoading || status !== 'authenticated'}
                                className="px-4 py-3 bg-cyan-800 text-white rounded-full hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-mono text-base font-bold transition"
                            >
                                <SendIcon className="w-5 h-5 mr-1" />
                                <span className="text-xl hover:underline">Send</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}