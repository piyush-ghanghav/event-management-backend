 // routes/eventRoutes.js
 const express = require('express');
 const router = express.Router();
 const eventController = require('../controllers/eventController');
 const authMiddleware = require('../middleware/authMiddleware');
 
 
 //route for getting all events
 router.get('/all', eventController.getAllEvents);
 
 //route for getting an event by ID
 router.get('/:id', eventController.getEventById);

 
 //Protected routes
 //route for creating a new event
 router.post('/create', authMiddleware, eventController.createEvent);
 
 //route for updating an event
 router.put('/update/:id', authMiddleware, eventController.updateEvent);
 
 //route for deleting an event
 router.delete('/delete/:id', authMiddleware, eventController.deleteEvent);

 
 module.exports = router;