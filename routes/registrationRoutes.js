require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const router = express.Router();
const Registration = require("../models/Registration");

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// Function to send confirmation email
const sendConfirmationEmail = (email, name, fivefolds) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to Panchmukhi Shiksha - Registration Successful",
    html: `<p>Dear ${name},</p>
           <p>Congratulations! Your registration has been successfully completed.</p>
           <p>You have been enrolled in the following fivefold activities: <strong>${fivefolds.join(", ")}</strong></p>
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

// Student Registration Route
router.post("/submit-student-registration", upload.single("image"), async (req, res) => {
  console.log("Received POST request on /api/registration/submit-student-registration");
  console.log("Request Body:", req.body);

  try {
    const { name, course, email, semester, smartcardId, phoneNumber, rollNumber, hostelName, fivefolds } = req.body;

    if (!name || !course || !email || !semester || !smartcardId || !phoneNumber || !rollNumber || !hostelName || !fivefolds) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ error: "Image is required." });
    }

    // Image path
    const imageUrl = "/uploads/" + req.file.filename;

    // Check for duplicate roll number
    const existingRegistration = await Registration.findOne({ rollNumber });
    if (existingRegistration) {
      return res.status(400).json({ error: "Student with this roll number is already registered." });
    }

    // Save the student registration
    const newRegistration = new Registration({
      name,
      course,
      email,
      semester,
      smartcardId,
      phoneNumber,
      rollNumber,
      hostelName,
      fivefolds: Array.isArray(fivefolds) ? fivefolds : fivefolds.split(",").map(f => f.trim()),
      imageUrl,
    });

    await newRegistration.save();

    // Send confirmation email after successful signup
    sendConfirmationEmail(email, name, newRegistration.fivefolds);

    return res.json({ message: "Student registered successfully! Confirmation email sent.", imageUrl });
  } catch (error) {
    console.error("Error in student registration:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
// attendance
router.get('/students', async (req, res) => {
  const { fivefold } = req.query;

  try {
     
      console.log("Querying students for fivefold:", fivefold);
      const students = await Registration.find({ fivefolds: { $in: [fivefold] } });
      res.json(students);
  } catch (error) {
      res.status(500).json({ error: "Server error" });
  }
});


// Export the router
module.exports = router;
