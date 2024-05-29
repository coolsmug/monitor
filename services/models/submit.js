const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  session:  {type: String, trim: true},
  term:  {type: String, trim: true},
  type:  {type: String, trim: true},
  subject:  {type: String, trim: true},
  ca_pos: {type: String, trim: true},
  answers: Map, // Key-value pairs of questionId and the user's answer
  score: Number,
  submittedAt: Date
});

module.exports = mongoose.model('Submission', submissionSchema);
