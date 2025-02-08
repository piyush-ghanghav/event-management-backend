 const express = require('express');
 const http = require('http');
 const mongoose = require('mongoose');
 const dotenv = require('dotenv');
 const cors = require('cors');
 
 
 dotenv.config();


 
 const app = express();
 const server = http.createServer(app);

 //  middleware
 app.use(cors());
 app.use(express.json());


 // connect to mongodb
 mongoose.connect(process.env.MONGO_URI)
 .then(() => {
     console.log('Connected to MongoDB');
 })
 .catch((error) => {
     console.error('Error connecting to MongoDB:', error);
 });


 //use routes
 app.use('/api/auth', require('./routes/authRoutes'));
 app.use('/api/events', require('./routes/eventRoutes'));


 // setup socket.io for real-time updates

 const io = require('socket.io')(server, {
   cors: {
     origin: '*',
     methods: ['GET', 'POST'],
   },
 });

 io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    socket.on('disconnect', () => {
      console.log('Client disconnected', socket.id);
    });
 });

 app.set('io', io);


 //listen to port
 const PORT = process.env.PORT || 5000;
 server.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
 });
