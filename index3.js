const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const userModel = require('./models/userModel');
const ChatMessage=require('./models/chatModel');
const app = express();
const server = http.createServer(app);

// Enable CORS for both Express and Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 2000;

// Middleware for serving static files
app.use(express.static('public'));

// Middleware for CORS https://restaurantaaraav.netlify.app/
app.use(cors({
  origin: 'https://urbangroove.netlify.app',
  credentials: true,
}));

const usernameMap = {};
let x=null;

app.get('/chat/:sender/:receiver',async(req,res)=>{
const sender=req.params.sender;
const receiver=req.params.receiver;
    const messages = await ChatMessage.find({
        $or: [
            { sender, receiver },
            { sender: receiver, receiver: sender },
        ],
    });

    return res.json(messages);
});

app.get('/chat-partners', async (req, res) => {
    try {
        // Find all chat messages where 'aar' is the receiver
        const chatsWithAdmin = await ChatMessage.find({ receiver: 'aar' });

        // Extract the unique senders from the chat messages
        const uniqueSenders = [...new Set(chatsWithAdmin.map(chat => chat.sender))];

        // Send the list of unique senders as a response
        res.json({ chatPartners: uniqueSenders });
    } catch (error) {
        console.error('Error fetching chat partners for admin:', error);
        res.status(500).json({ error: 'An error occurred while fetching chat partners for admin.' });
    }
});

// Handle new socket connections
io.on('connection', (socket) => {
  console.log(`New client connected with ${socket.id}`);

  // Emit a welcome message
  socket.emit('message', 'Welcome to the WebSocket server!');

  socket.on('register',({username})=>{
    usernameMap[username]=socket.id;
    console.log('registerd user:',username);
  })
 

socket.on('chat', async({ chat, sender, receiver }) => {
 console.log(`send chat from ${sender} to ${receiver}:`,chat)

 const newChatMessage = new ChatMessage({
    sender,
    receiver,
    chat,
});

// Save the message to the database
await newChatMessage.save();

 io.to(usernameMap[receiver]).emit('get',{chat,sender});
});



  // Handle socket disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');

    // Remove the username and socket ID from the map
  
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
