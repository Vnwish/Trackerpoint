const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  createdAt: {
		type: Date,
		default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
