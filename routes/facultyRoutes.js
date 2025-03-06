require('dotenv').config();
const express = require('express');
const router = express.Router();
const Faculty = require('../models/faculty'); 
const User = require('../models/user'); 
const nodemailer = require("nodemailer");
const Attendance = require("../models/attendance");

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
    },
});

// Function to send confirmation email
const sendConfirmationEmail = (email, name) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to Panchmukhi Shiksha - Faculty Registration Successful",
        html: `<p>Dear ${name},</p>
               <p>Congratulations! Your registration as a Faculty member has been successfully completed.</p>
               <p>Best Regards,<br>Panchmukhi Shiksha Team</p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error(`Error sending email: ${err.message}`);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });
};

// POST route to handle faculty signup
router.post('/submit-faculty-signup', async (req, res) => {
    console.log('Received POST request on /api/faculty/submit-faculty-signup');
    console.log('Request Body:', req.body);

    const { name, email, phone, department, fivefold, username, password, securityQuestion, securityAnswer } = req.body;
    
    // Ensure all required fields are present
    if (!email || !username || !password || !name || !phone || !department || !fivefold || !securityQuestion || !securityAnswer) {
        console.log('Missing Fields:', { name, email, phone, department, fivefold, username, password, securityQuestion, securityAnswer });
        return res.status(400).json({ error: 'All fields must be provided.' });
    }

    try {
        // Check if email already exists in Faculty collection
        const existingFaculty = await Faculty.findOne({ email });
        const existingUser = await User.findOne({ username });

        if (existingFaculty) {
            return res.status(400).json({ error: 'Email already in use in the faculty database.' });
        }

        if (existingUser) {
            return res.status(400).json({ error: 'Username already in use.' });
        }

        // Validate email format
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }

        // Save faculty details
        const newFaculty = new Faculty({
            name,
            email,
            phone,
            department,
            fivefold,
            username,
            password,
            securityQuestion,
            securityAnswer,
        });

        console.log('Saving new faculty...');
        await newFaculty.save();
        console.log('Faculty is saved in Faculty module');

        // Save user data in User schema
        const newUser = new User({
            username,
            password,
            email, 
            role: 'faculty', 
        });

        await newUser.save();

        // Send confirmation email after successful signup
        sendConfirmationEmail(email, name);

        return res.json({ message: 'Faculty created successfully! Confirmation email sent.' });
    } catch (err) {
        console.error('Error creating faculty:', err);
        return res.json({ message: 'Error creating faculty', error: err.message });
    }
});


// ✅ Get Faculty List (Name + Email for Chat)
router.get("/list", async (req, res) => {
    try {
        const facultyList = await Faculty.find({}, "name email"); // Sirf name aur email fetch ho raha hai
        res.json(facultyList);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch faculty list" });
    }
});

// Get all faculties
router.get('/all', async (req, res) => {
    try {
        const faculties = await Faculty.find();
        res.json(faculties);
    } catch (error) {
        res.status(500).json({ message: "Error fetching faculties", error });
    }
});

// Delete a faculty by username
router.delete('/:username', async (req, res) => {
    try {
        const deletedFaculty = await Faculty.findOneAndDelete({ username: req.params.username });
        if (!deletedFaculty) return res.status(404).json({ message: "Faculty not found" });

        res.json({ message: "Faculty deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting faculty", error });
    }
});

// Export the router object
module.exports = router;
