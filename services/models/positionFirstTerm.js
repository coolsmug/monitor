const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const learnerPositionSchema = new mongoose.Schema({
  learnerId: {
    type: mongoose.Types.ObjectId,
    trim: true,
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Currentclass'
  },
  classofs: {
    type: String,
    trim: true,
    required: true
  },
  term: {
    type: String,
    trim: true,
    required: true
  },
  total_score: {
    type: Number,
    default: 0 // Default value is 0
  },
  position: {
    type: Number,
   
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'School'
  }
});

// Indexes
learnerPositionSchema.index({ learnerId: 1, classId: 1, classofs: 1, term: 1, schoolId: 1 });

const Position = mongoose.model('Position', learnerPositionSchema);

module.exports = Position;
