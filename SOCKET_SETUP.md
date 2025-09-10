# Socket.IO Real-time Setup

This document explains the Socket.IO implementation for real-time communication in the healthcare application.

## 🚀 Features Implemented

### 1. Real-time Chat
- **Instant messaging** between users and the healthcare bot
- **WebSocket connection** for low-latency communication
- **Message persistence** with encryption for security

### 2. Typing Indicators
- **Real-time typing status** showing when the bot is responding
- **Visual feedback** for better user experience

### 3. Connection Status
- **Live connection indicator** showing WebSocket status
- **Automatic reconnection** handling
- **Error handling** with user feedback

## 📁 Files Added/Modified

### New Files:
- `server.js` - Custom Next.js server with Socket.IO integration
- `src/hooks/useSocket.ts` - React hook for Socket.IO client
- `src/lib/socket.ts` - Socket.IO type definitions
- `src/app/socket-test/page.tsx` - Test page for Socket.IO functionality

### Modified Files:
- `package.json` - Updated scripts to use custom server
- `src/app/chatbot/page.tsx` - Integrated Socket.IO for real-time chat

## 🔧 Installation & Setup

### 1. Dependencies Installed
```bash
npm install socket.io socket.io-client
```

### 2. Server Configuration
The application now uses a custom server (`server.js`) that integrates:
- Next.js application server
- Socket.IO WebSocket server
- CORS configuration for development and production

### 3. Environment Variables
Make sure you have these environment variables set:
```env
SECRET_KEY=your-secret-key-for-encryption
NEXT_PUBLIC_APP_URL=https://your-domain.com (for production)
PYTHON_CHATBOT_URL=http://localhost:5000/chat (optional)
```

## 🎯 How It Works

### 1. Server-Side (server.js)
```javascript
// Socket.IO server setup
const io = new Server(httpServer, {
  cors: {
    origin: dev ? "http://localhost:3000" : process.env.NEXT_PUBLIC_APP_URL,
    methods: ["GET", "POST"]
  }
});

// Event handlers
io.on('connection', (socket) => {
  // Handle user connections, messages, typing indicators
});
```

### 2. Client-Side (useSocket.ts)
```typescript
// React hook for Socket.IO
export const useSocket = (userId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  // Connection management and event handling
};
```

### 3. Chat Integration (chatbot/page.tsx)
```typescript
// Real-time message handling
socket.on('new-message', (message: Message) => {
  setMessages(prev => [...prev, message]);
});

// Send messages via Socket.IO
socket.emit('send-message', { userId, message });
```

## 🧪 Testing

### 1. Test Page
Visit `/socket-test` to test the Socket.IO functionality:
- Open multiple browser tabs
- Send messages and see real-time updates
- Check connection status

### 2. Chat Page
Visit `/chatbot` to use the real-time healthcare assistant:
- Real-time messaging with the bot
- Typing indicators
- Connection status display

## 🚀 Running the Application

### Development
```bash
npm run dev
```
This starts the custom server with Socket.IO support.

### Production
```bash
npm run build
npm start
```

## 🔒 Security Features

### 1. Message Encryption
- User messages are encrypted using AES encryption
- Bot responses are stored in plain text (as they're generated)
- Encryption key stored in environment variables

### 2. Room-based Communication
- Each user gets their own room for private communication
- Messages are only sent to the intended user's room

### 3. CORS Configuration
- Proper CORS setup for development and production
- Prevents unauthorized cross-origin requests

## 📊 Real-time Events

### Client to Server:
- `join-room` - Join user's personal room
- `send-message` - Send a message to the bot
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator

### Server to Client:
- `new-message` - Receive new message
- `user-typing` - Typing status update
- `error` - Error messages
- `connect`/`disconnect` - Connection status

## 🎨 UI Enhancements

### 1. Connection Status
- Green dot: Connected
- Red dot: Disconnected
- Real-time status updates

### 2. Typing Indicators
- "Bot is typing..." message
- Visual feedback during bot responses

### 3. Message Bubbles
- User messages: Blue bubbles on the right
- Bot messages: Gray bubbles on the left
- Timestamps for each message

## 🔄 Migration from REST API

The chatbot now uses Socket.IO instead of REST API calls:
- **Before**: HTTP POST requests to `/api/messages`
- **After**: Real-time WebSocket communication
- **Benefits**: Lower latency, better user experience, real-time features

## 🐛 Troubleshooting

### Common Issues:

1. **Connection Failed**
   - Check if the server is running
   - Verify CORS settings
   - Check network connectivity

2. **Messages Not Appearing**
   - Verify Socket.IO connection status
   - Check browser console for errors
   - Ensure proper event listeners

3. **Typing Indicators Not Working**
   - Check if typing events are being emitted
   - Verify event listener setup

## 📈 Performance Benefits

- **Reduced Latency**: WebSocket connections are faster than HTTP requests
- **Real-time Updates**: Instant message delivery
- **Better UX**: Typing indicators and connection status
- **Scalable**: Socket.IO handles multiple concurrent connections efficiently

## 🔮 Future Enhancements

Potential improvements:
- **File sharing** via Socket.IO
- **Voice messages** integration
- **Video calls** for telemedicine
- **Push notifications** for offline users
- **Message reactions** and emoji support
- **Group chat** functionality for multiple users
