const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const thirdSectionSchema = new Schema(
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

thirdSectionSchema.virtual("url").get(function () {
  return `/sessions/section/${this._id}`;
});

const ThirdSection = mongoose.model("ThirdSection", thirdSectionSchema);
module.exports = ThirdSection;
