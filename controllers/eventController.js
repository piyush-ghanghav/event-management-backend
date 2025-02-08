const Event = require('../models/Event'); 
const mongoose = require('mongoose');
const User = require('../models/User'); // Add this at the top

// Add this validation function at the top
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const { name, description, date, isPrivate, imageUrl, location, category } = req.body;
        
        // Verify all required fields are present
        if (!name) {
            return res.status(400).json({ message: 'Event name is required' });
        }
        if (new Date(date) < new Date()) {
            return res.status(400).json({ 
                message: 'Event date cannot be in the past' 
            });
        }

        const newEvent = new Event({ 
            name,  
            description, 
            date,
            owner: req.user.userId,  
            isPrivate: isPrivate || false,
            imageUrl: imageUrl || '',
            location: location || '',
            category: category || ''    
        });
        
        const savedEvent = await newEvent.save();
        // Socket.io event emission
        const io = req.app.get('io');
        io.emit('new-event', savedEvent);
        res.status(201).json(savedEvent);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}; 

// Get all events
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('owner', 'username')
            .populate('attendees', 'username email');
            
            const eventsWithAttendanceInfo = events.map(event => {
            const eventObj = event.toObject();
            eventObj.isUserAttending = req.user ? 
                event.attendees.some(a => a._id.toString() === req.user.userId) : 
                false;
            return eventObj;
        });

        res.status(200).json(eventsWithAttendanceInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get event by ID
exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid event ID format' });
        }

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Event 

exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid event ID format' });
        }

        const updates = req.body;
        const event = await Event.findById(id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });    
        }

        if (event.owner.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Validate date if it's being updated
        if (updates.date && new Date(updates.date) < new Date()) {
            return res.status(400).json({ 
                message: 'Event date cannot be in the past' 
            });
        }

        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                event[key] = updates[key];
            }
        });

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Event

exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid event ID format' });
        }

        const event = await Event.findById(id);
        if(!event) {
            return res.status(404).json({ message: 'Event not found' });    
        }

        if(event.owner.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await event.deleteOne();
        res.json({ message: 'Event deleted successfully' });

    } catch (error) {    
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }    
};

// Add attendees

exports.addAttendee = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid event ID format' });
        }

        const { attendee } = req.body;
        const event = await Event.findById(id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });    
        }

        // Check if event is private and requester is not owner
        if (event.isPrivate && event.owner.toString() !== req.user.userId) {
            return res.status(403).json({ 
                message: 'Only event owner can add attendees to private events' 
            });
        }

        // Check if attendee already exists
        if (event.attendees.some(a => a.email === attendee)) {
            return res.status(400).json({ message: 'Attendee already added' });
        }

        // Find or create user
        const user = await User.findOne({ email: attendee });
        
        const newAttendee = {
            email: attendee,
            registered: !!user,
            userId: user ? user._id : null
        };

        event.attendees.push(newAttendee);
        await event.save();

        const populatedEvent = await Event.findById(id)
            .populate('owner', 'username')
            .populate('attendees.userId', 'username email');

        // Emit socket event
        const io = req.app.get('io');
        io.emit('update-attendees', {
            eventID: id,
            attendees: populatedEvent.attendees
        });
        
        res.json(populatedEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.joinEvent = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid event ID format' });
        }

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });    
        }

        // Check if event is private
        if (event.isPrivate) {
            return res.status(403).json({ 
                message: 'This is a private event. Only the owner can add attendees.' 
            });
        }

        // Check if user is already attending
        if (event.attendees.some(a => a.userId && a.userId.toString() === req.user.userId)) {
            return res.status(400).json({ message: 'You are already registered for this event' });
        }

        // Add user as attendee
        const user = await User.findById(req.user.userId);
        const newAttendee = {
            email: user.email,
            registered: true,
            userId: user._id
        };

        event.attendees.push(newAttendee);
        await event.save();

        const populatedEvent = await Event.findById(id)
            .populate('owner', 'username')
            .populate('attendees.userId', 'username email');

        // Emit socket event
        const io = req.app.get('io');
        io.emit('update-attendees', {
            eventID: id,
            attendees: populatedEvent.attendees
        });

        res.json(populatedEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
