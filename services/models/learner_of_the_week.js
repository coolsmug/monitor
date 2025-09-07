const mongoose = require("mongoose");

const learnerOfTheWeekSchema = new mongoose.Schema(
  {
    rollno: {
        type: String,
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
    slug: {
      type: String
    },
    hobbies: [String],
    achievements: [String],
    likes: [String],
    dislikes: [String],
    futureGoals: [String],
    quote: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const LearnerOfTheWeek = mongoose.model("LearnerOfTheWeek", learnerOfTheWeekSchema);
module.exports = LearnerOfTheWeek;
