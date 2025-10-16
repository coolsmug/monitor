// models/StaffAttendance.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const learnerAttendanceSchema = new Schema({
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Learner',
    required: true
  },
    date: {
    type: Date,
    required: true,
    default: () => new Date().setHours(0, 0, 0, 0) // always store date only
  },
    clockIn: {
    type: Date,
  },
    clockOut: {
    type: Date,
  }
}, { timestamps: true });