const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  password: { type: String, required: true },
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
