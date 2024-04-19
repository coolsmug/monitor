const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema(
  {
    roll_no: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      sparse: true,
    },
    date_started: {
      type: Date,
      required: true,
      sparse: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'School'
    },
    sectionId: [
      {
        section: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Section',
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    classof: {
      type: String,
      trim: true,
      required: true,
    },
    date_ended: {
      type: Date,
      required: true,
    },
    dnow: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);



const Session = mongoose.model('Session', sessionSchema);
module.exports = Session
