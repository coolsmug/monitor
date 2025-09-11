const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: String,
  questionType: { 
    type: String, 
    enum: ['multiple_choice', 'fill_in_the_gap'], 
    required: true
  },
    options: [String], // Only for multiple_choice questions
  correctAnswer: {
  type: mongoose.Schema.Types.Mixed,
  validate: {
    validator: function (v) {
      return typeof v === "string" || typeof v === "number";
    },
    message: props => `${props.value} must be a string or number`
  },
  set: v => typeof v === "string" ? v.trim() : v  // trims only if string
},

  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  instruction:  {type: String, trim: true},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Add this field
});

module.exports = mongoose.model('Question', questionSchema);
