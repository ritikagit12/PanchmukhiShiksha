const express = require("express");
const Attendance = require("../models/attendance");
const Registration = require("../models/Registration"); 
const router = express.Router();

router.post("/submit-attendance", async (req, res) => {
  console.log("Received Attendance Data:", req.body);

  let { date, fivefold, attendance } = req.body;
  if (!date || !fivefold || !attendance) {
      return res.status(400).json({ error: "Date, fivefold, and attendance data are required" });
  }

  try {
      const formattedDate = new Date(date).toLocaleDateString("en-US");

    
      let existingRecord = await Attendance.findOne({ date: formattedDate, fivefold });

      if (!existingRecord) {
          // ✅ Create new attendance record if none exists
          existingRecord = new Attendance({
              date: formattedDate,
              fivefold,
              students: []
          });
      }

      attendance.forEach(student => {
          let studentEntry = existingRecord.students.find(s => s.smartcardId === student.smartcardId);

          if (studentEntry) {
              
              studentEntry.present = student.present;
          } else {
              
              existingRecord.students.push({
                  smartcardId: student.smartcardId,
                  name: student.name,
                  course: student.course,
                  semester: student.semester,
                  present: student.present
              });
          }
      });

      await existingRecord.save();
      res.json({ message: "Attendance submitted successfully!" });

  } catch (error) {
      console.error("Error submitting attendance:", error);
      res.status(500).json({ error: "Error submitting attendance" });
  }
});

// ✅ Fetch attendance for a specific student
router.post("/my-attendance", async (req, res) => {
  try {
      const { smartCardId } = req.body;
      if (!smartCardId) return res.status(400).json({ error: "SmartCard ID required" });

      const student = await Registration.findOne({ smartcardId: smartCardId });
      if (!student) return res.status(404).json({ error: "Student not found in registration" });

      const attendanceRecords = await Attendance.find({ "students.smartcardId": smartCardId });

      if (!attendanceRecords.length) return res.json({ fivefolds: student.fivefolds, data: [] });

      const attendanceMap = {};

      attendanceRecords.forEach(record => {
          let studentEntry = record.students.find(s => s.smartcardId === smartCardId);
          if (!studentEntry) return;

          if (!attendanceMap[record.date]) {
              attendanceMap[record.date] = { date: record.date };
          }

          attendanceMap[record.date][record.fivefold] = studentEntry.present ? "Present" : "Absent";
      });

      const formattedAttendance = Object.values(attendanceMap);

      res.json({ fivefolds: student.fivefolds, data: formattedAttendance });

  } catch (error) {
      console.error("Error fetching attendance:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch attendance for a faculty
router.post("/get-attendance", async (req, res) => {
    try {
        console.log("Received request data:", req.body);
        const { date, fivefold } = req.body;

        if (!date || !fivefold) {
            return res.status(400).json({ error: "Date and Fivefold are required" });
        }

        const formattedDate = new Date(date).toLocaleDateString("en-US");
        const attendanceData = await Attendance.findOne({ date: formattedDate, fivefold });

        if (!attendanceData) {
            return res.status(404).json({ message: "No records found for the given date and fivefold" });
        }

        res.json(attendanceData.students);
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;