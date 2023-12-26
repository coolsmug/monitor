const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const thirdExamSchema = new Schema(
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
    total_over_all: {
      type: Number,
    },
    qone: {
        type: Number,
      },
      qtwo: {
        type: Number,
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
    per_over_all: {
      type: String,
    },
    grade: {
      type: String,
      trim: true,
     
    },
    remarks: {
      type: String,
      trim: true,
     
    },
    _learner: {

      type: mongoose.Types.ObjectId,
      trim: true,
  
      
      },
      createdAt: {
        type: Date,
        default: Date.now // Set default value to the current date and time when the document is created
    }
  
  },
  { timestamps: true }
);



const Examing = mongoose.model('Examing', thirdExamSchema);
module.exports = Examing;

