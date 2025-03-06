const express = require('express');
const router = express.Router();
const Admin = require('../models/admin'); 
const User = require('../models/user'); 


router.get("/username/:username", async (req, res) => {
    try {
        const admin = await Admin.findOne({ username: req.params.username });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.json(admin);
    } catch (error) {
        console.error("Error fetching admin:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// Update Admin Profile
router.put("/updateAdmin/:username", async (req, res) => {
  try {
      const { username } = req.params;
      const { name, phone } = req.body;

      
      const updatedAdmin = await Admin.findOneAndUpdate(
          { username },
          { name, phone },
          { new: true } 
      );

      if (!updatedAdmin) {
          return res.status(404).json({ message: "Admin not found" });
      }

      res.json({ message: "Profile updated successfully", admin: updatedAdmin });
  } catch (error) {
      console.error("Error updating admin profile:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

