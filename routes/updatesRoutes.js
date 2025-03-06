const express = require("express");
const Update = require("../models/updates");
const Student = require("../models/student");

const router = express.Router();

// ✅ POST: Save Faculty Update
router.post("/", async (req, res) => {
  try {
    const { name, fivefold, note } = req.body;

    if (!name || !note) {
      return res.status(400).json({ message: "Name and Note are required!" });
    }

    const newUpdate = new Update({ name, fivefold, note });
    await newUpdate.save();

    res.status(201).json({ message: "Update saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error saving update", error });
  }
});


router.get("/:studentName", async (req, res) => {
  try {
    const studentName = req.params.studentName;

    // Find the student and check their registered fivefold activity
    const student = await Student.findOne({ name: studentName });

    if (!student || !student.fivefold) {
      return res.status(404).json({ message: "Student not registered in any activity." });
    }

    // Fetch updates only for the student's registered activity
    const updates = await Update.find({ fivefold: student.fivefold })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json(updates);
  } catch (error) {
    console.error("Error fetching updates:", error);
    res.status(500).json({ error: "Failed to fetch updates" });
  }
});

// GET: Fetch Latest Updates (Only Last 24 Hours)
router.get("/", async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const updates = await Update.find({ createdAt: { $gte: twentyFourHoursAgo } }) 
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(updates);
  } catch (error) {
    console.error("Error fetching updates:", error);
    res.status(500).json({ error: "Failed to fetch updates" });
  }
});

module.exports = router;
