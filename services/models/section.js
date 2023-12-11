const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sectionSchema = new Schema(
  {
    roll_no: {
      type: Number,
      trim: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'School'
    },
    classof: {
      type: String,
      trim: true,
      required: true,
    },
    date_started: {
      type: Date,
      required: true,
    },
    date_ended: {
      type: Date,
      required: false,
    },
    datenow: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

sectionSchema.virtual("url").get(function () {
  return `/sessions/section/${this._id}`;
});

const Section = mongoose.model("Section", sectionSchema);
module.exports = Section;
