
require('dotenv').config();
const nodemailer = require("nodemailer");
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const socketIo = require("socket.io");
const http = require("http"); 

const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const User = require('./models/user'); 
//const userRoutes = require('./routes/userRoutes');
const loginRoutes = require('./routes/loginRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const path = require('path');
const Faculty = require('./models/faculty');
const Student = require('./models/student');
const Admin = require('./models/admin');
const Registration = require('./models/Registration'); 
const paymentRoutes = require("./routes/paymentRoutes");
const updatesRoutes = require('./routes/updatesRoutes');
const auth = require("./routes/auth");
console.log("Auth Routes:", auth); 
const chatRoutes = require("./routes/chatRoutes");
const Chat = require("./models/chat");
const attendanceRoutes = require("./routes/attendanceRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();
const router = express.Router();
const PORT = 5000;
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

mongoose.connect('mongodb://localhost:27017/panchmukhiShiksha')
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

app.get('/', (req, res) => {
  console.log('Root route accessed');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Register Routes
console.log('Login route...');
app.use('/api/login', loginRoutes);
console.log('Login routes registered at /api/login');

console.log('Registering student routes...');
app.use('/api/student', studentRoutes);
console.log('Student routes registered at /api/student');

console.log('Registering faculty routes...');
app.use('/api/faculty', facultyRoutes);
console.log('Faculty routes registered at /api/faculty');


console.log('Registerin admin faculty routes...');
app.use('/api/admin', adminRoutes);
console.log('Admin routes registered at /api/admin');

console.log('Registering student 5fold register routes...');
app.use('/api/registration', registrationRoutes);
console.log('Student 5fold register routes at ');

console.log('update routes...');
app.use('/api/updates', updatesRoutes);
console.log('updates routes at ');

console.log('payment routes...');
app.use("/api/payments", paymentRoutes);
console.log('payment routes at ');

console.log("Auth route...");
app.use("/api/auth", auth);
console.log("Auth routes registered at /api/auth");

console.log('chat routes...');
app.use("/api/chats", chatRoutes)
console.log('chat routes at ');

console.log('Attendance routes...');
app.use("/api/attendance", attendanceRoutes)
console.log('Attendance routes at ');

console.log('Events routes...');
app.use("/api/events", eventRoutes);
console.log('Events routes at ');


app.post("/api/login", async (req, res) => {
  const { role, username, password } = req.body;

  try {
    
    const user = await User.findOne({ role, username, password });
    console.log('User found:', user);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    // Fetch student details using email if the user is a student
    let student= null;
    let faculty=null;
    let registration = null;

    
    if (role === "student") {
      student = await Student.findOne({ email: user.email });
      console.log('User Email:', user.email);  // Check email from user
      registration = await Registration.findOne({ email: user.email });
      console.log("Registration Details:", registration); // Debugging
    
    }

    if (role === "faculty") {
      faculty = await Faculty.findOne({ email: user.email }); 
  }
    // Send user + student details in the response
    res.status(200).json({
      message: "Login successful!",
      user: {
        
        username: user.username,
        password: user.password,
        email: user.email,
        role: user.role,
      },
      student: student ,
      faculty: faculty,
      registration: registration, 
   
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



const activitySchema = new mongoose.Schema({
  id: String,
  title: String,
  image: String,
  time: String,
  faculty: String,
  requirements: String,
  achievements: String,
  duration: String,
  location: String
});

const Activity = mongoose.model('Activity', activitySchema, 'activities');
const Practical = mongoose.model('Practical', activitySchema, 'practicals');
const Aesthetic = mongoose.model('Aesthetic', activitySchema, 'aesthetics');

// **Activity API Routes**
app.get('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findOne({ id: req.params.id });
    if (!activity) return res.status(404).send({ error: 'Activity not found' });
    res.send(activity);
  } catch (err) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).send(activity);
  } catch (err) {
    res.status(400).send({ error: 'Failed to create activity' });
  }
});

//  **Practical API Routes**
app.get('/api/practicals/:id', async (req, res) => {
  try {
    const practical = await Practical.findOne({ id: req.params.id });
    if (!practical) return res.status(404).send({ error: 'Practical not found' });
    res.send(practical);
  } catch (err) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.post('/api/practicals', async (req, res) => {
  try {
    const practical = new Practical(req.body);
    await practical.save();
    res.status(201).send(practical);
  } catch (err) {
    res.status(400).send({ error: 'Failed to create practical' });
  }
});

//  **Aesthetic API Routes**
app.get('/api/aesthetics/:id', async (req, res) => {
  try {
    const aesthetic = await Aesthetic.findOne({ id: req.params.id });
    if (!aesthetic) return res.status(404).send({ error: 'Aesthetic not found' });
    res.send(aesthetic);
  } catch (err) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.post('/api/aesthetics', async (req, res) => {
  try {
    const aesthetic = new Aesthetic(req.body);
    await aesthetic.save();
    res.status(201).send(aesthetic);
  } catch (err) {
    res.status(400).send({ error: 'Failed to create aesthetic' });
  }
});

//EMAIL
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});


app.put("/api/updateStudent/:username", async (req, res) => {
  const { username } = req.params;
  const { name, phone } = req.body;

  try {
      const updatedStudent = await Student.findOneAndUpdate(
          { username: username },  // Find student by email
          { name: name, phone: phone },  // Update fields
          { new: true }  // Return updated document
      );

      if (!updatedStudent) {
          return res.status(404).json({ message: "Student not found" });
      }

      res.json({ message: "Profile updated successfully", student: updatedStudent });

  } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});


app.put("/api/updateFaculty/:username", async (req, res) => {
  const { username } = req.params;
  const { name, phone } = req.body;

  try {
      const updatedFaculty = await Faculty.findOneAndUpdate(
          { username: username },  // Find student by email
          { name: name, phone: phone },  // Update fields
          { new: true }  // Return updated document
      );

      if (!updatedFaculty) {
          return res.status(404).json({ message: "Faculty not found" });
      }

      res.json({ message: "Profile updated successfully", faculty: updatedFaculty });

  } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ success: false, message: "Logout failed" });
      }
      res.json({ success: true });
  });
});

//  Real-time Chat with Email
io.on("connection", (socket) => {
  console.log("🔵 User connected:", socket.id);

  socket.on("sendMessage", async (data) => {
    try {
        let senderName = data.senderName; 

       
        if (!data.senderName) {
            const faculty = await Faculty.findOne({ email: data.senderEmail });
            senderName = faculty ? faculty.name : "Unknown Sender";
        }

        const newMessage = new Chat({
            senderEmail: data.senderEmail,
            senderName: senderName, 
            receiverEmail: data.receiverEmail,
            message: data.message,
            timestamp: new Date() 
        });

        await newMessage.save();

        
        io.emit("receiveMessage", {
            senderEmail: newMessage.senderEmail,
            senderName: newMessage.senderName,
            receiverEmail: newMessage.receiverEmail,
            message: newMessage.message,
            timestamp: newMessage.timestamp 
        });

    } catch (error) {
        console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
  });
});


app.get("/attendance", async (req, res) => {
  const facultyUsername = req.session.username; 
  if (!facultyUsername) return res.redirect("/login"); 

  const faculty = await Faculty.findOne({ username: facultyUsername });
  if (!faculty) return res.status(404).send("Faculty not found");

  res.render("attendance", { fivefold: faculty.fivefold }); 
});




//  **Start the server**
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
