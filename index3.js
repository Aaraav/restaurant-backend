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
// https://urbangroove.netlify.app
// Middleware for CORS https://restaurantaaraav.netlify.app/
app.use(cors({
  origin: ['https://restaurent-mern-frontend.vercel.app/','http://localhost:3000'],
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

  // socket.on('notification', ({ sender, receiver, message }) => {
  //   console.log(`Received notification from ${sender} to ${receiver}: ${message}`);
  
  //   // Get the socket ID of the receiver
  //   const receiverSocketId = usernameMap[receiver];
  
  //   // Broadcast the notification to the receiver
  //   if (receiverSocketId) {
  //     io.to(receiverSocketId).emit('notification', {
  //       sender,
  //       message,
  //     });
  //   }
  // });
 socket.on('notification',async({chat, sender, receiver})=>{
  console.log(receiver);
  
 io.to(usernameMap[receiver]).emit('noti', {
  title: 'New Message',
  sender:sender,
  receiver:receiver,
  chat:chat,
  message: `You received a new message from ${sender}`,
});
console.log('notofication');
 })

socket.on('chat', async({ chat, sender, receiver }) => {
 console.log(`send chat from ${sender} to ${receiver}:`,chat)

 const newChatMessage = new ChatMessage({
    sender,
    receiver,
    chat,
});

// Save the message to the database

 io.to(usernameMap[receiver]).emit('get',{chat,sender});
 
//  io.to(usernameMap[receiver]).emit('notification', {
//   title: 'New Message',
//   sender:sender,
//   receiver:receiver,
//   message: `You received a new message from ${sender}`,
// });

await newChatMessage.save();

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
