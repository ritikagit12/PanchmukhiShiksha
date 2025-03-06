const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const User = require('../models/user'); 
const Admin = require('../models/admin'); 

// POST route to handle student signup
router.post('/submit-student-signup', async (req, res) => {
  console.log('Received POST request on /api/student/submit-student-signup');
  console.log('Request Body:', req.body);

  const { name, email, phone, smartCardId, course, username, password, securityQuestion, securityAnswer } = req.body;

  // Ensure email and other required fields are present
  if (!email || !username || !password || !name || !phone || !smartCardId || !course) {
    return res.status(400).json({ error: 'All fields must be provided.' });
  }

  try {
    // Check if the email already exists in the student collection
    const existingStudent = await Student.findOne({ email });
    const existingUser = await User.findOne({ username });

    // If a student or user already exists, return an error message
    if (existingStudent) {
      return res.status(400).json({ error: 'Email already in use in the student database.' });
    }

    if (existingUser) {
      return res.status(400).json({ error: 'Username already in use.' });
    }

    // Ensure email format is valid
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Create a new student and save it to the database
    const newStudent = new Student({
      name,
      email,
      phone,
      smartCardId,
      course,
      username,
      password,
      securityQuestion,
      securityAnswer,
    });

    // Save student to the Student collection
    await newStudent.save();

    // Save user data in User schema
    const newUser = new User({
      username,
      password,
      email,
      role: 'student', 
    });

    // Save user to the User collection
    await newUser.save();

    res.status(201).json({ message: 'Student signed up successfully!' });

  } catch (error) {
    console.error('Error signing up student:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ✅ Get Logged-In User Data
router.get("/", async (req, res) => {
    try {
        
        const userEmail = req.session.userEmail || req.user.email;
        if (!userEmail) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ email: user.email, name: user.name, role: user.role });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});


// Export the router object
module.exports = router;
