// models/Event.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true, 
    index: true  // index for faster searches on event name
  },
  description: { 
    type: String, 
    trim: true 
  },
  date: { 
    type: Date, 
    required: true, 
    index: true  // index on date to help with date-based queries
  },
  // Store attendees as references to User model, 
  // which makes it easier to populate user details later
  attendees: [{
    email: String,
    registered: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}],
  // The user who created the event
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  // Field to mark events as public or private
  isPrivate: { 
    type: Boolean, 
    default: false,
    required: true 
  },
  // Optional field for an image URL
  imageUrl: { 
    type: String, 
    trim: true 
  },


  location: { 
    type: String, 
    trim: true 
  },
  category: { 
    type: String, 
    trim: true 
  },
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Event", eventSchema);
