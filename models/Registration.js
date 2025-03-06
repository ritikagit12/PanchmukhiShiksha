const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    course: { type: String, required: true },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: [true, 'Email must be unique'], 
        validate: {
          validator: function(v) {
            return /\S+@\S+\.\S+/.test(v);
          },
          message: props => `${props.value} is not a valid email format!`
        }
      },
    semester: { type: String, required: true },
    smartcardId: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    hostelName: { type: String, required: true },
    fivefolds: { type: [String], required: true, validate: v => v.length === 3 },
    imageUrl: { type: String, required: true },  // Store the image URL
    registeredAt: { type: Date, default: Date.now }
});

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;
