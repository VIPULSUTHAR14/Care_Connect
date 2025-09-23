// Reason for the error:
// The error is thrown if the environment variable SECRET_KEY is not defined. This key is required for encrypting and decrypting messages using AES encryption. If it's missing, encryption/decryption cannot proceed securely, so the code throws an error to alert the developer to define SECRET_KEY in the .env.local file.

import { getDatabase } from '@/lib/ConnectDB';
import CryptoJS from "crypto-js";
import { GoogleGenerativeAI, Content, SafetySetting, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest, NextResponse } from 'next/server';

// --- ENCRYPTION SETUP (Unchanged) ---
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
        if (!decryptedText) {
            throw new Error("Decryption resulted in an empty string.");
        }
        return decryptedText;
    } catch (error) {
        console.error("Decryption failed for a message:", ciphertext, error);
        return "Message could not be decrypted.";
    }
};

// --- GEMINI API SETUP (Unchanged) ---
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    throw new Error('Please define the GEMINI_API_KEY environment variable inside .env.local');
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


// --- GET HANDLER (Unchanged) ---
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    try {
        const db = await getDatabase();
        const messagesCollection = db.collection('messages');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        const messagesFromDb = await messagesCollection.find({ userId }).sort({ timestamp: 1 }).toArray();

        // Decrypt user messages before sending to client
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


// --- POST HANDLER (Refactored for Health-Only Responses) ---
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

        // 2. Fetch recent chat history for context
        const recentMessages = await messagesCollection
            .find({ userId })
            .sort({ timestamp: -1 })
            .limit(10) 
            .toArray();

        const chatHistory: Content[] = recentMessages.reverse().map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.sender === 'user' ? decryptMessage(msg.message) : msg.message }],
        }));

        // --- MODIFICATION 1: DEFINE SYSTEM INSTRUCTION ---
        const healthBotSystemInstruction: Content[] = [
            {
                role: "user",
                parts: [{ text: `You are 'HealthBot', an expert AI assistant specializing in Symptom checker and you give answer that feel safe and dont threaten patient and if something serieous only suggest doctor. Your sole purpose is to answer user queries strictly related to health, fitness, nutrition, and mental well-being.

                **Your Rules:**
                1.  **Strictly On-Topic:** If a user asks a question that is NOT about health (e.g., about history, programming, celebrities, or general chit-chat), you MUST politely decline. Your decline message must start with: 'I am a health-focused assistant'.
                2.  **Disclaimer First:** ALWAYS begin your answer with the disclaimer: 'Disclaimer: This information is for educational purposes only and is not a substitute for professional medical advice. Always consult a qualified healthcare provider.'
                3.  **Never Diagnose:** You must never provide a medical diagnosis or prescribe treatment. Instead, suggest consulting a healthcare professional.
                `}],
            },
            {
                role: "model",
                parts: [{ text: "Understood. I am HealthBot, ready to assist with health and wellness questions." }],
            }
        ];

        // 3. Call the Gemini API with history and new controls
        let botResponseText = '';
        try {
            // --- MODIFICATION 2: ADD CONFIGURATION TO THE API CALL ---
            const chat = model.startChat({
                history: [...healthBotSystemInstruction, ...chatHistory], // Prepend system instruction to history
                generationConfig: {
                    temperature: 0.2, // Lower temperature for more factual answers
                },
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                ],
            });

            const result = await chat.sendMessage(message);
            const response = result.response;
            botResponseText = response.text();

        } catch(err: any) {
            console.error("Error calling Gemini API:", err?.message);
            botResponseText = "Sorry, I'm having trouble connecting to the AI service right now.";
        }
        
        // --- MODIFICATION 3: POST-RESPONSE VALIDATION AND REFINEMENT ---
        const disclaimer = "Disclaimer: This information is for educational purposes only and is not a substitute for professional medical advice. Always consult a qualified healthcare provider.";

        // If the model declined, we accept its response as valid.
        const isModelDecline = botResponseText.startsWith("I am a health-focused assistant");

        // If it's NOT a decline, we enforce our rules.
        if (!isModelDecline) {
            // Rule: Enforce the disclaimer programmatically.
            if (!botResponseText.startsWith(disclaimer)) {
                 botResponseText = disclaimer + "\n\n" + botResponseText;
            }
        }
        // You could add more validation here, like checking for banned keywords, before saving.

        // 4. Save the bot's response
        const botMessage = {
            userId,
            message: botResponseText, // Bot messages are not encrypted
            sender: 'bot',
            timestamp: new Date(),
        };
        await messagesCollection.insertOne(botMessage);
        
        // 5. Send the bot's response back to the frontend
        return NextResponse.json({ success: true, botResponse: botResponseText });
    } catch (error) {
        console.error('POST Error:', error);
        return NextResponse.json({ success: false, error: 'Server error while processing message' }, { status: 500 });
    }
}