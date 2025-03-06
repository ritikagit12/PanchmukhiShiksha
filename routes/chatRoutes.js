const express = require("express");
const Chat = require("../models/chat");
const Faculty = require("../models/faculty");
const Student = require('../models/student');


const router = express.Router();

// ✅ Faculty List Fetch Karna
router.get("/faculty-list", async (req, res) => {
    try {
        
        const studentEmail = req.query.studentEmail;
        if (!studentEmail) {
            return res.status(400).json({ error: "Student email is required" });
        }

        // Fetch all faculty members
        const faculties = await Faculty.find({}, "name email");

        // Faculty list with last message and unread count
        const facultyList = await Promise.all(
            faculties.map(async (faculty) => {
                const lastMessage = await Chat.findOne({
                    $or: [
                        { senderEmail: faculty.email, receiverEmail: studentEmail },
                        { senderEmail: studentEmail, receiverEmail: faculty.email }
                    ]
                })
                .sort({ timestamp: -1 }) // Latest message
                .select("message timestamp");

                const unreadCount = await Chat.countDocuments({
                    senderEmail: faculty.email,
                    receiverEmail: studentEmail,
                    read: false
                });

                return {
                    name: faculty.name,
                    email: faculty.email,
                    lastMessage: lastMessage ? lastMessage.message : "",
                    timestamp: lastMessage ? lastMessage.timestamp : null,
                    unreadCount: unreadCount
                };
            })
        );

        
        facultyList.sort((a, b) => {
            if (!a.timestamp && !b.timestamp) return 0; 
            if (!a.timestamp) return 1; 
            if (!b.timestamp) return -1;
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        res.json(facultyList);
    } catch (error) {
        console.error("Error fetching faculty list:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// ✅ Student List Fetch Karna
router.get("/student-list", async (req, res) => {
    try {
        const facultyEmail = req.query.facultyEmail;
        if (!facultyEmail) {
            return res.status(400).json({ error: "Faculty email is required" });
        }

        // Fetch all students assigned to this faculty
        const students = await Student.find({}, "name email");

        // Student list with last message and unread count
        const studentList = await Promise.all(
            students.map(async (student) => {
                const lastMessage = await Chat.findOne({
                    $or: [
                        { senderEmail: facultyEmail, receiverEmail: student.email },
                        { senderEmail: student.email, receiverEmail: facultyEmail }
                    ]
                })
                .sort({ timestamp: -1 }) 
                .select("message timestamp");

                const unreadCount = await Chat.countDocuments({
                    senderEmail: student.email,
                    receiverEmail: facultyEmail,
                    read: false 
                });

                return {
                    name: student.name,
                    email: student.email,
                    lastMessage: lastMessage ? lastMessage.message : "",
                    timestamp: lastMessage ? lastMessage.timestamp : null,
                    unreadCount: unreadCount
                };
            })
        );

        
        studentList.sort((a, b) => {
            if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
            if (!a.timestamp && !b.timestamp) return 0;
            if (!a.timestamp) return 1;
            if (!b.timestamp) return -1;
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        res.json(studentList);
    } catch (error) {
        console.error("Error fetching student list:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});




router.get("/:studentEmail/:facultyEmail", async (req, res) => {
    try {
        const { studentEmail, facultyEmail } = req.params;
        const chats = await Chat.find({
            $or: [
                { senderEmail: studentEmail, receiverEmail: facultyEmail },
                { senderEmail: facultyEmail, receiverEmail: studentEmail }
            ]
        }).sort("timestamp");

        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
});


router.post("/send", async (req, res) => {
    try {
        const { senderEmail, receiverEmail, receiverName, message } = req.body;
        const newMessage = new Chat({
            senderEmail,
            receiverEmail,
            receiverName,
            message,
            read: false 
        });
        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: "Message sending failed" });
    }
});


router.get("/getMessages", async (req, res) => {
    try {
        const { facultyEmail, studentEmail } = req.query;

        if (!facultyEmail || !studentEmail) {
            return res.status(400).json({ error: "Both facultyEmail and studentEmail are required!" });
        }

        const messages = await Chat.find({
            receiverEmail: facultyEmail,
            senderEmail: studentEmail
        }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.get("/history", async (req, res) => {
    try {
        const { studentEmail, facultyEmail } = req.query;

        if (!studentEmail || !facultyEmail) {
            return res.status(400).json({ message: "Student email and faculty email are required" });
        }

        const messages = await Chat.find({
            $or: [
                { senderEmail: studentEmail, receiverEmail: facultyEmail },
                { senderEmail: facultyEmail, receiverEmail: studentEmail }
            ]
        }).sort({ timestamp: 1 }); 

        res.json(messages);
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// ✅ Faculty list sorted by last message time + Unread count
router.get("/recent-messages", async (req, res) => {
    try {
        const studentEmail = req.query.studentEmail;
        if (!studentEmail) return res.status(400).json({ error: "Student email is required" });

        const facultyChats = await Chat.aggregate([
            {
                $match: {
                    $or: [{ senderEmail: studentEmail }, { receiverEmail: studentEmail }]
                }
            },
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: {
                        facultyEmail: {
                            $cond: {
                                if: { $eq: ["$senderEmail", studentEmail] },
                                then: "$receiverEmail",
                                else: "$senderEmail"
                            }
                        }
                    },
                    lastMessageTime: { $first: "$timestamp" },
                    unreadCount: {
                        $sum: {
                            $cond: [{ $and: [{ $eq: ["$receiverEmail", studentEmail] }, { $eq: ["$read", false] }] }, 1, 0]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "faculties",
                    localField: "_id.facultyEmail",
                    foreignField: "email",
                    as: "facultyData"
                }
            },
            { $unwind: "$facultyData" },
            {
                $project: {
                    name: "$facultyData.name",
                    email: "$_id.facultyEmail",
                    lastMessageTime: 1,
                    unreadCount: 1
                }
            },
            { $sort: { lastMessageTime: -1 } }
        ]);

        res.json(facultyChats);
    } catch (error) {
        console.error("Error fetching recent messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// ✅ Mark messages as read for both faculty and student
router.post("/mark-as-read", async (req, res) => {
    try {
        const { studentEmail, facultyEmail } = req.body;
        if (!studentEmail || !facultyEmail) {
            return res.status(400).json({ error: "Invalid request" });
        }

        await Chat.updateMany(
            { 
                $or: [
                    { senderEmail: facultyEmail, receiverEmail: studentEmail, read: false },
                    { senderEmail: studentEmail, receiverEmail: facultyEmail, read: false }
                ]
            },
            { $set: { read: true } }
        );

        res.json({ success: true, message: "Messages marked as read" });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;
