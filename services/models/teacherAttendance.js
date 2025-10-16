// models/StaffAttendance.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const staffAttendanceSchema = new Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
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

// Ensure one attendance record per staff per day
staffAttendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });

const StaffAttendance = mongoose.model('StaffAttendance', staffAttendanceSchema);
module.exports = StaffAttendance;
