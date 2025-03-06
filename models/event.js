const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    organizer: { type: String, required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],  // ✅ ObjectId store kar rahe hain
    createdAt: { type: Date, default: Date.now }
});

// Model export karo
const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
