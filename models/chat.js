const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    senderEmail: String,  // Student ka email
    senderName: String,  //
    receiverEmail: String, // Faculty ka email
    receiverName: String,  // Faculty ka naam
    message: String,  // Message text
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false } // ✅ Add this field if missing
});

module.exports = mongoose.model("Chat", chatSchema);