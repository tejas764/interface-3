const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  contact: {
    type: String,
    required: true,
    match: /^\d{10}$/
  },
  institution: {
    type: String,
    required: true
  },
  state: {
    type: String,
    enum: ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat', 'Other'],
    required: true
  },
  events: {
    type: [String],
    default: null,
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  receipt: {
    url: String,
    public_id: String
  }
});


module.exports = mongoose.model('Registration', registrationSchema);

