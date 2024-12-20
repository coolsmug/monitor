const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {type: String, trim: true},
  description:  {type: String, trim: true},
  position:  {type: String, trim: true},
  duration: Number, // Duration in minutes
  student_class: {type: String, trim: true},
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  startTime: Date,
  ca_pos: {type: String, trim: true},
  userId: [ String ],
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  session:  {type: String, trim: true},
  term:  {type: String, trim: true},
  type:  {type: String, trim: true},

});

module.exports = mongoose.model('Test', testSchema);
