require('dotenv').config();
const express = require('express');
const router = express.Router();
const Student = require('../models/student'); 
const User = require('../models/user');
const Registration = require("../models/Registration");
const nodemailer = require("nodemailer");

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
        subject: "Welcome to Panchmukhi Shiksha - Student Registration Successful",
        html: `<p>Dear ${name},</p>
               <p>Congratulations! Your registration as a Student has been successfully completed.</p>
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

// POST route for student signup
router.post('/submit-student-signup', async (req, res) => {
    console.log('Received POST request on /api/student/submit-student-signup');
    console.log('Request Body:', req.body);

    const { name, email, phone, course, username, password, securityQuestion, securityAnswer } = req.body;

    if (!email || !username || !password || !name || !phone || !course) {
        return res.json({ success: false, message: 'All fields must be provided.' });
    }

    try {
        const existingStudent = await Student.findOne({ email });
        const existingUser = await User.findOne({ username });

        if (existingStudent) {
            return res.json({ success: false, message: 'Email already in use in the student database.' });
        }

        if (existingUser) {
            return res.json({ success: false, message: 'Username already in use.' });
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.json({ success: false, message: 'Invalid email format.' });
        }

        const newStudent = new Student({
            name, email, phone, course, username, password, securityQuestion, securityAnswer,
        });
        await newStudent.save();

        const newUser = new User({ username, password, email, role: 'student' });
        await newUser.save();

        // Send confirmation email after successful signup
        sendConfirmationEmail(email, name);

        return res.json({ success: true, message: 'Signup successful! Confirmation email sent.' });

    } catch (error) {
        console.error('Error signing up student:', error.message);
        return res.json({ success: false, message: `Error: ${error.message}` });
    }
});
router.post('/reset-password', async (req, res) => {
    console.log('Received POST request on /api/student/reset-password');
    console.log('Request Body:', req.body);

    const { role, username, securityQuestion, securityAnswer, newPassword } = req.body;

    if (!role || !username || !securityQuestion || !securityAnswer || !newPassword) {
        return res.json({ success: false, message: 'Please provide all required fields.' });
    }

    try {
        // Verify the user based on role and username
        let user;
        if (role === 'student') {
            user = await Student.findOne({ username });
            if (!user) {
                return res.json({ success: false, message: 'Student not found.' });
            }
        } else {
            
            return res.json({ success: false, message: 'Invalid role.' });
        }

        // Check if the security question and answer match
        if (user.securityQuestion !== securityQuestion || user.securityAnswer !== securityAnswer) {
            return res.json({ success: false, message: 'Security question or answer is incorrect.' });
        }

        // Update the password
        user.password = newPassword;
        await user.save();

        // Optionally update the User collection as well
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            existingUser.password = newPassword;
            await existingUser.save();
        }

        // Send confirmation email after password reset
        sendConfirmationEmail(user.email, user.name);

        return res.json({ success: true, message: 'Password reset successful! Confirmation email sent.' });

    } catch (error) {
        console.error('Error resetting password:', error.message);
        return res.json({ success: false, message: `Error: ${error.message}` });
    }
});

router.get("/getStudent/:email", async (req, res) => {
    try {
        const student = await Student.findOne({ email: req.params.email });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.json({ name: student.name });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch student data" });
    }
});

// Route to get all students
router.get("/student-list", async (req, res) => {
    try {
        const students = await Student.find({}, "name email"); // Fetch name & email only
        res.json(students);
    } catch (error) {
        console.error("Error fetching student list:", error);
        res.status(500).json({ error: "Server error" });
    }
});
// Get all students
router.get("/all", async (req, res) => {
    try {
      const students = await Student.aggregate([
        {
          $lookup: {
            from: "registrations", 
            localField: "email", 
            foreignField: "email", 
            as: "registrationDetails",
          },
        },
        {
          $project: {
            username: 1,
            email: 1,
            course: 1,
            fivefolds: { $arrayElemAt: ["$registrationDetails.fivefolds", 0] }, 
          },
        },
      ]);
  
      res.status(200).json(students);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

// Delete a student by username
router.delete('/:username', async (req, res) => {
    try {
        const deletedStudent = await Student.findOneAndDelete({ username: req.params.username });
        if (!deletedStudent) return res.status(404).json({ message: "Student not found" });

        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting student", error });
    }
});


// attendance
router.get('/students', async (req, res) => {
    const { fivefold } = req.query;

    try {
        // Fetch students from the correct collection (registration)
        console.log("Querying students for fivefold:", fivefold);
        const students = await Registration.find({ fivefolds: { $in: [fivefold] } });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});



// Export the router object
module.exports = router;
