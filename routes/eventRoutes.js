const express = require("express");
const Event = require("../models/event");
const User = require("../models/user"); 
const Student = require('../models/student'); 

const router = express.Router();

// Create a new event
router.post("/add", async (req, res) => {
    try {
        const { title, description, date,  location, organizer } = req.body;

        const newEvent = new Event({
            title,
            description,
            date,
            location,
            organizer
        });

        await newEvent.save();
        res.status(201).json({ message: "Event created successfully", event: newEvent });
    } catch (error) {
        res.status(500).json({ message: "Error creating event", error: error.message });
    }
});


router.get("/", async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: "Error fetching events", error: error.message });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: "Error fetching event details", error: error.message });
    }
});


router.post("/register/:eventId", async (req, res) => {
    try {
        const { email } = req.body;

       
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        
        if (event.attendees.includes(student._id)) {
            return res.status(400).json({ message: "User already registered for this event" });
        }

       
        event.attendees.push(student._id);
        await event.save();

        res.json({ message: "User registered successfully", event });
    } catch (error) {
        res.status(500).json({ message: "Error registering for event", error: error.message });
    }
});

// Fetch attendees with name and email
router.get("/:eventId/attendees", async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId).populate("attendees", "name email");
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json(event.attendees);
    } catch (error) {
        res.status(500).json({ message: "Error fetching attendees", error: error.message });
    }
});


// Delete an event
router.delete("/:eventId", async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.eventId);
        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting event", error: error.message });
    }
});

module.exports = router;
