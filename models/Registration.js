const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  name: String,
  email: String,
  contact: String,
  institution: String,
  state: String,
  events: [String],
  receiptImage: String,
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Registration', registrationSchema);
