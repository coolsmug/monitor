const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const proprietorSchema = new Schema(
  {
   full_name: {
      type: String,
      required: true,
      trim: true,
    },

  excellent: {
    type: String,
    required: true,
    trim: true,
   },

  very_good: {
      type: String,
      required: true,
      trim: true,
    },
   
   good: {
      type: String,
      required: true,
    },
    pass: {
      type: String,
      required: true,
    },
    poor: {
      type: String,
      required: true,
    },
    vpoor: {
      type: String,
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'School'
    },
    createdAt: {
      type: Date,
      default: Date.now // Set default value to the current date and time when the document is created
  }
  },
  { timestamps: true }
);


const Proprietor = mongoose.model('Proprietor', proprietorSchema);
module.exports = Proprietor;