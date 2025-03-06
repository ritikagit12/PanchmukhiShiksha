const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/student'); 
const Faculty = require('../models/faculty'); 
const Admin = require('../models/admin'); 

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret_key';

// Login route
router.post('/api/login', async (req, res) => {
  const { username, password, role } = req.body;

  try {
   
    let userModel;
    switch (role) {
      case 'student':
        userModel = Student;
        break;
      case 'faculty':
        userModel = Faculty;
        break;
      case 'admin':
        userModel = Admin;
        break;
      default:
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Check if the user exists in the specified role collection
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate the password
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      role,
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
