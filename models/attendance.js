const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  date: String,
  fivefold: String,
  students: [
    { 
      smartcardId: String, 
      name: String,  // ✅ Add name field
      course: String, // ✅ Add course field
      semester: String,
      present: Boolean 
    }
  ]
});

module.exports = mongoose.model("Attendance", attendanceSchema);