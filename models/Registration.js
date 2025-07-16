const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  name: String,
  email: String,
  contact: String,
  institution: String,
  state: String,
  events: [String],
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

