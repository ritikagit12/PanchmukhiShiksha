const mongoose = require('mongoose');

// Define the schema for students
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
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
  phone: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v); 
      },
      message: 'Invalid phone number' 
    }
  },
  course: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  securityQuestion: { type: String, required: true },
  securityAnswer: { type: String, required: true },
}, { timestamps: true });

// Create and export the model
const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
