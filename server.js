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


 //use authentication routes
 app.use('/api/auth', require('./routes/authRoutes'));
 //use event routes
 app.use('/api/events', require('./routes/eventRoutes'));


 //listen to port
 const PORT = process.env.PORT || 5000;
 server.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
 });
