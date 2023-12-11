 const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const examSchema = new Schema(
  {
    roll_no: {
      type: String,
      trim: true,
     
    },
    student_name: {
      type: String,
      trim: true,
     
    },
    name: {
      type: String,
      trim: true,
    },
    classofs : {
      type: String,
      trim: true,
    },
    term: {
      type: String,
      trim: true,
     
    },
    overall_first_ca: {
      type: Number,
    },
    mark_obtained_first_ca: {
      type: Number,
    },
    overall_second_ca: {
      type: Number,
    },
    mark_otained_second_ca: {
      type: Number,
    },
    overall_third_ca: {
      type: Number,
    },
    mark_otained_third_ca: {
      type: Number,
    },
    exam_overall: {
      type: Number,
    },
    exam_mark_obtain: {
      type: Number,
    },
    term_total: {
      type: Number,
    },
    grade: {
      type: String,
     
    },
    remarks: {
      type: String,
     
    },
    _learner: {

      type: mongoose.Types.ObjectId,
      trim: true,
  
      
      },
  
  },
  { timestamps: true }
);

examSchema.virtual("url").get(function () {
  return `/sessionId/sectionId/leanerId/${this._id}`;
})

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;

