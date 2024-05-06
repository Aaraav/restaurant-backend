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
    origin: 'https://restaurantaaraav.netlify.app/',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 1000;

// Middleware for serving static files
app.use(express.static('public'));

// Middleware for CORS
app.use(cors({
  origin: 'https://restaurantaaraav.netlify.app/',
  credentials: true,
}));

const usernameMap = {};

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

  // Send the foodname data to the admin
  io.to(usernameMap[name]).emit('food', { username, foodname,orderid });

  // Do something with the data here
});

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
