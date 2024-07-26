const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const userModel = require('./models/userModel');

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

const PORT = process.env.PORT || 1000;

// Middleware for serving static files
app.use(express.static('public'));

// Middleware for CORS https://restaurantaaraav.netlify.app/
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

const usernameMap = {};
let x=null;
// Handle new socket connections
io.on('connection', (socket) => {
  console.log(`New client connected with ${socket.id}`);

  // Emit a welcome message
  socket.emit('message', 'Welcome to the WebSocket server!');

 // Handle 'foodname' event
socket.on('foodname', async ({ username, foodname, name,orderid }) => {
  console.log(`Received foodname from ${username}:`, foodname);

  const user = await userModel.findOne({ username: username });
  const admin = await userModel.findOne({ username: name });

  // Add the username and socket ID to the map
  usernameMap[username] = socket.id;
x=usernameMap[username];
  // Send the foodname data to the admin
  io.to(usernameMap[name]).emit('food', { username, foodname,orderid,id:socket.id});

  // Do something with the data here
});



socket.on('status',async ({ username, globalStatus, name,orderid ,id,reason}) => {
  // const targetSocketId = usernameMap[username];
// console.log(targetSocketId);
// usernameMap[username]=socket.id;
  // Emit the 'stat' event to the target client using their socket ID
  // console.log(globalStatus);
  console.log('sended to',usernameMap[username]);
  console.log('Emitting stat event:', { globalStatus, username,name, orderid,reason });
console.log("id",id);

      io.to(id).emit("stat", { globalStatus, username, orderid,reason });
 
})

// socket.on('chat', ({ chat, username, name }) => {
//   console.log(`Received chat from ${username}: ${chat}`);
  
//   // Register the sender's username and socket ID if not already registered
//   usernameMap[username] = socket.id;
  
//   // Check if the recipient (name) is registered in usernameMap
//   if (!usernameMap[name]) {
//     const recipientSocketId = usernameMap[name];
//     console.log('recipientSocketId',recipientSocketId);
//     io.to(recipientSocketId).emit('get', { chat, username });
//       console.log(`Sent chat message from ${username} to ${name}: ${chat}`);
//   } else {
//       console.log(`Recipient ${name} not found in usernameMap`);
//   }
// });



  // Handle socket disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');

    // Remove the username and socket ID from the map
    for (const [username, socketId] of Object.entries(usernameMap)) {
      if (socketId === socket.id) {
        delete usernameMap[username];
        break;
      }
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
