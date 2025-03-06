const mongoose = require("mongoose");

const updateSchema = new mongoose.Schema({
  name: String, 
  fivefold: String,
  note: String
}, { timestamps: true }); 

const Update = mongoose.model("Update", updateSchema);

module.exports = Update;
