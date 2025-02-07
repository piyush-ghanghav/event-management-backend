const Event = require('../models/Event'); 

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const { name, description, date } = req.body;
        
        // Verify all required fields are present
        if (!name) {
            return res.status(400).json({ message: 'Event name is required' });
        }

        const newEvent = new Event({ 
            name,  
            description, 
            date,
            owner: req.user.userId  
        });
        
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}; 

// Get all events
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get event by ID
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
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
        const {name , description, date} = req.body;
        let event = await Event.findById(req.params.id);
        if(!event) {
            return res.status(404).json({ message: 'Event not found' });    
        }

        if(event.owner.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        event.name = name || event.name;
        event.description = description || event.description;
        event.date = date || event.date;

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
        const event = await Event.findById(req.params.id);
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