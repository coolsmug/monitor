const mongoose = require("mongoose");

const teacherOfTheMonthSchema = new mongoose.Schema(
  {
    teacherId: {
     type : String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    skoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    hobbies: [String],
    achievements: [String],
    likes: [String],
    dislikes: [String],
    subject: [String],
    quote: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const TeacherOfTheMonth = mongoose.model("TeacherOfTheMonth", teacherOfTheMonthSchema);
module.exports = TeacherOfTheMonth;
