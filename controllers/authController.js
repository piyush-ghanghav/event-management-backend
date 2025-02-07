const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
    
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        //check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        //generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        
        res.status(201).json({token, message: "User registered successfully" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }        
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({token, message: "Login successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// In controllers/eventController.js
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
            owner: req.user.userId  // Changed from req.user._id to req.user.userId
        });
        
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};