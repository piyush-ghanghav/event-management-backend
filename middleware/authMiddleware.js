 // middleware/authMiddleware.js
 const jwt = require('jsonwebtoken');

 module.exports = (req, res, next) => {
    const token = req.header('Authorization').split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' || 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' || 'Unauthorized' });
    }
 }