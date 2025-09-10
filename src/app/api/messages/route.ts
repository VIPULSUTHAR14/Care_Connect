// Reason for the error:
// The error is thrown if the environment variable SECRET_KEY is not defined. This key is required for encrypting and decrypting messages using AES encryption. If it's missing, encryption/decryption cannot proceed securely, so the code throws an error to alert the developer to define SECRET_KEY in the .env.local file.

import { getDatabase } from '@/lib/ConnectDB'; // Use getDatabase instead of dbConnect
import CryptoJS from "crypto-js"
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// --- ENCRYPTION HELPERS ---
// This part remains the same as it's independent of the database.
const secretKey: string | undefined = process.env.SECRET_KEY;
if (!secretKey) {
    throw new Error('Please define the SECRET_KEY environment variable inside .env.local for encryption.');
}

const encryptMessage = (text: string): string => {
    return CryptoJS.AES.encrypt(text, secretKey).toString();
};

const decryptMessage = (ciphertext: string): string => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        // Handle cases where decryption might result in an empty string for valid ciphertext
        if (!decryptedText) {
             throw new Error("Decryption resulted in an empty string.");
        }
        return decryptedText;
    } catch (error) {
        console.error("Decryption failed for a message:", ciphertext, error);
        return "Message could not be decrypted.";
    }
};

// --- GET HANDLER ---
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    try {
        const db = await getDatabase(); // Use getDatabase instead of dbConnect
        const messagesCollection = db.collection('messages'); // Specify the collection name here

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        const messagesFromDb = await messagesCollection.find({ userId }).sort({ timestamp: 1 }).toArray();

        const decryptedMessages = messagesFromDb.map((msg: any) => ({
            ...msg,
            message: msg.sender === 'user' ? decryptMessage(msg.message) : msg.message
        }));

        return NextResponse.json({ success: true, messages: decryptedMessages });
    } catch (error) {
        console.error('GET Error:', error);
        return NextResponse.json({ success: false, error: 'Server error while fetching messages' }, { status: 500 });
    }
}

// --- POST HANDLER ---
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, message } = body as { userId?: string; message?: string };
        
        if (!userId || !message) {
            return NextResponse.json({ success: false, error: 'User ID and message are required' }, { status: 400 });
        }

        const db = await getDatabase();
        const messagesCollection = db.collection('messages');

        // 1. Encrypt and save the user's message
        const userMessage = {
            userId,
            message: encryptMessage(message),
            sender: 'user',
            timestamp: new Date(),
        };
        await messagesCollection.insertOne(userMessage);

        // 2. Call the Python chatbot backend
        const chatbotUrl = process.env.PYTHON_CHATBOT_URL || 'http://localhost:5000/chat';
        let botResponseText = '';
        try {
            const botApiResponse = await axios.post(chatbotUrl, { userId, message });
            botResponseText = botApiResponse.data.response || "Sorry, I didn't understand that.";
        } catch(err: any) {
             console.error("Error calling Python chatbot:", err?.message);
             botResponseText = "There was an error connecting to the chatbot service.";
        }

        // 3. Save the bot's response
        const botMessage = {
            userId,
            message: botResponseText,
            sender: 'bot',
            timestamp: new Date(),
        };
        await messagesCollection.insertOne(botMessage);
        
        // 4. Send the bot's response back to the frontend
        return NextResponse.json({ success: true, botResponse: botResponseText });
    } catch (error) {
        console.error('POST Error:', error);
        return NextResponse.json({ success: false, error: 'Server error while processing message' }, { status: 500 });
    }
}