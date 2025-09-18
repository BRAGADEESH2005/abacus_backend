const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  sequence: {
    type: Number,
    default: 0,
    required: true
  }
}, {
  timestamps: true
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;