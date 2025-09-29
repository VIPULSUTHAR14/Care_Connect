// /src/app/api/messages/route.ts

import { getDatabase } from '@/lib/ConnectDB';
import CryptoJS from "crypto-js";
// 1. FIX: Removed unused 'SafetySetting' import
import { GoogleGenerativeAI, Content, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest, NextResponse } from 'next/server';
import { Document } from 'mongodb'; // Import Document type for better typing

// 2. FIX: Removed unused 'medicine' import

// --- TYPE DEFINITION ---
// 3. FIX: Define a specific type for message documents from the database
interface MessageDocument extends Document {
    userId: string;
    message: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

// --- ENCRYPTION SETUP ---
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

// --- GEMINI API SETUP ---
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    throw new Error('Please define the GEMINI_API_KEY environment variable inside .env.local');
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


// --- GET HANDLER (Fetch Chat History) ---
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    try {
        const db = await getDatabase();
        const messagesCollection = db.collection<MessageDocument>('messages');
        const messagesFromDb = await messagesCollection.find({ userId }).sort({ timestamp: 1 }).toArray();

        // 3. FIX: Use the specific MessageDocument type instead of 'any'
        const decryptedMessages = messagesFromDb.map((msg: MessageDocument) => ({
            ...msg,
            message: msg.sender === 'user' ? decryptMessage(msg.message) : msg.message
        }));

        return NextResponse.json({ success: true, messages: decryptedMessages });
    } catch (error: unknown) { // Bonus fix
        console.error('GET Error:', error);
        return NextResponse.json({ success: false, error: 'Server error while fetching messages' }, { status: 500 });
    }
}


// --- POST HANDLER (Send a Message) ---
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, message } = body as { userId?: string; message?: string };
        
        if (!userId || !message) {
            return NextResponse.json({ success: false, error: 'User ID and message are required' }, { status: 400 });
        }

        const db = await getDatabase();
        const messagesCollection = db.collection<MessageDocument>('messages');

        // 1. Encrypt and save the user's message
        const userMessage = {
            userId,
            message: encryptMessage(message),
            sender: 'user' as const,
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

        // 3. Define the System Instruction for the bot's persona
       const healthBotSystemInstruction: Content[] = [
    {
        role: "user",
        parts: [{ text: `You are 'HealthBot', a friendly and cautious AI assistant based in India. Your goal is to be helpful and reassuring, not to alarm the user. You are aware of common over-the-counter medicine brands in India.

        **Your Core Rules:**

        1.  **Stay On Topic:** If the user asks about anything other than health, fitness, or nutrition, you MUST politely decline. Start your reply with: 'I am a health-focused assistant and can only answer health-related questions.'

        2.  **AVOID DIAGNOSIS, DISCUSS POSSIBILITIES:** This is a critical rule. You must NEVER give a direct diagnosis (e.g., "You have malaria"). Instead, you can discuss *possibilities* in a general and non-alarming way. For example: "Symptoms like a high fever and chills can sometimes be associated with illnesses like viral fever, dengue, or malaria. It is very important to see a doctor for a proper diagnosis."

        3.  **SUGGEST COMMON OTC MEDICINES CAUTIOUSLY:** For very mild, common symptoms (like a simple headache or body aches with a cold), you can mention common over-the-counter medicines available in India (e.g., Paracetamol, Crocin, Dolo 650, Ibuprofen). ALWAYS state that this is not a prescription and that they must read the label and consult a pharmacist or doctor, especially if they have other health conditions.

        4.  **ALWAYS PRIORITIZE PROFESSIONAL ADVICE:** This is your most important rule. If symptoms are serious, persist for more than a day or two, are unusual, or if you are in any doubt, your primary and clearest advice MUST be to consult a doctor immediately.

        5.  **Add a Note at the End:** After your main answer, add a safety note titled "**Important Note**" at the very end of health-related responses.
        `
        }],
    },
    {
        role: "model",
        parts: [{ text: "Understood. I am HealthBot. I will be a friendly, cautious assistant in India. I will discuss possibilities without diagnosing, suggest common OTC medicines carefully, and always prioritize urging users to see a doctor for a proper diagnosis." }],
    }
];

        // 4. Call the Gemini API
        let botResponseText = '';
        try {
            const chat = model.startChat({
                history: [...healthBotSystemInstruction, ...chatHistory],
                generationConfig: { temperature: 0.2 },
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                ],
            });

            const result = await chat.sendMessage(message);
            botResponseText = result.response.text();

        } catch(err: unknown) { // 4. FIX: Use the type-safe 'unknown' instead of 'any'
            console.error("Error calling Gemini API:", err instanceof Error ? err.message : err);
            botResponseText = "Sorry, I'm having trouble connecting to the AI service right now. Please try again later.";
        }
        
        // 5. Post-response validation to enforce the safety note at the bottom
        const safetyNote = "\n\n---\n**Important Note:** The information provided here is for educational purposes and general guidance. It is not a substitute for professional medical advice from a qualified doctor.";
        const isModelDecline = botResponseText.startsWith("I am a health-focused assistant");

        if (!isModelDecline && !botResponseText.includes("Important Note:")) {
            botResponseText += safetyNote;
        }

        // 6. Save the bot's response
        const botMessage = {
            userId,
            message: botResponseText,
            sender: 'bot' as const,
            timestamp: new Date(),
        };
        await messagesCollection.insertOne(botMessage);
        
        // 7. Send the bot's response back to the frontend
        return NextResponse.json({ success: true, botResponse: botResponseText });

    } catch (error: unknown) { // Bonus fix
        console.error('POST Error:', error);
        return NextResponse.json({ success: false, error: 'Server error while processing message' }, { status: 500 });
    }
}