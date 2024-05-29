const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: String,
  questionType: { type: String, enum: ['multiple_choice', 'fill_in_the_gap'], required: true },
  options: [String], // Only for multiple_choice questions
  correctAnswer: String,
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  instruction:  {type: String, trim: true},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Add this field
});

module.exports = mongoose.model('Question', questionSchema);
