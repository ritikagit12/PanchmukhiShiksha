require("dotenv").config();

const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();
const mongoURI = process.env.MONGODB_URI; 
const dbName = process.env.DATABASE_NAME ;

const client = new MongoClient(mongoURI);


async function connectDB() {
    if (!client.topology) await client.connect();
    console.log("✅ Connected to MongoDB:", dbName);
    return client.db(dbName);
}


router.post("/validate-security", async (req, res) => {
    try {
        const { role, username, securityQuestion, securityAnswer } = req.body;
        console.log("Received Request Data:", { role, username, securityQuestion, securityAnswer });

        const db = await connectDB();
        const collectionName = role === "student" ? "students" : "faculty";
        console.log(`Checking in collection: ${collectionName}`);

        const collection = db.collection(collectionName);

    
        const allUsers = await collection.find({}).toArray();
        console.log("All Users in Collection:", allUsers);

        // Find user by username
        const user = await collection.findOne({ username });
        console.log("User Found in DB:", user);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Check if security question and answer match
        if (user.securityQuestion === securityQuestion && user.securityAnswer === securityAnswer) {
            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: "Security details do not match" });
        }
    } catch (error) {
        console.error("Error in /validate-security:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
router.post("/reset-password", async (req, res) => {
    try {
        console.log("📌 Reset Password API Hit");
        const { username, role, newPassword } = req.body;
        console.log("Reset Password Request Data:", { username, role, newPassword });

        const db = await connectDB();
        const collection = db.collection(role === "student" ? "students" : "faculty");

        console.log("🔍 Checking collection:", collection.collectionName);

       
        const result = await collection.updateOne(
            { username: username },
            { $set: { password: newPassword } }
        );

        console.log("🔄 Update Result:", result);

        if (result.modifiedCount > 0) {
            console.log("✅ Password updated successfully");
            return res.json({ success: true, message: "Password updated successfully" });
        } else {
            console.log("❌ Failed to update password");
            return res.json({ success: false, message: "Failed to update password" });
        }
    } catch (error) {
        console.error("❗ Error in /reset-password:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
module.exports = router;
