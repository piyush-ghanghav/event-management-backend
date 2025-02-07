 const express = require('express');
 const router = express.Router();
 const authController = require('../controllers/authController');
 
 //route for user registration
 router.post('/register', authController.register);

 //route for user login
 router.post('/login', authController.login);
 
 module.exports = router; 