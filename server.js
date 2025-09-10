const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: dev ? "http://localhost:3000" : process.env.NEXT_PUBLIC_APP_URL,
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO event handlers
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their personal room
    socket.on('join-room', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    // Handle new messages
    socket.on('send-message', async (data) => {
      try {
        const { userId, message } = data;
        
        if (!userId || !message) {
          socket.emit('error', { message: 'User ID and message are required' });
          return;
        }

        // Emit user message to the room
        socket.to(userId).emit('new-message', {
          userId,
          message: message,
          sender: 'user',
          timestamp: new Date(),
        });

        // Simulate bot response (you can replace this with your actual bot logic)
        setTimeout(() => {
          const botResponse = `I received your message: "${message}". This is a real-time response!`;
          
          // Emit bot response to the room
          socket.to(userId).emit('new-message', {
            userId,
            message: botResponse,
            sender: 'bot',
            timestamp: new Date(),
          });
        }, 1000);

      } catch (error) {
        console.error('Error processing message:', error);
        socket.emit('error', { message: 'Server error while processing message' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      socket.to(data.userId).emit('user-typing', { isTyping: true });
    });

    socket.on('typing-stop', (data) => {
      socket.to(data.userId).emit('user-typing', { isTyping: false });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
