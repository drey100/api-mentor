const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialty: { type: String, required: true },
  bio: { type: String },
  photo: { type: String },
});

module.exports = mongoose.model('Mentor', mentorSchema);