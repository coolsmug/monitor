const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LearnerSchema = new Schema(
  {
    roll_no: {
      type: String,
      required: true,
      trim: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Currentclass'
    },

    arm: {
      type: String,

      trim: true,

    },
    classes: {
      type: String,

      trim: true,

    },

    first_name: {
      type: String,

      trim: true,

  
      required: true,
    },

    last_name: {
      type: String,

      trim: true,


      required: true,
    },

    middle_name: {
      type: String,

      trim: true,

    },

    email: {
      type: String,
     
      sparse: true,
    
      trim: true,


      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      trim: true,
      
    },

    age : {
      type: String,
      trim: true,

    },

    parent_number: {
      type: Number,
      minlength: 3,
    },
    dob: {
      type: Date,
    },

    date_enrolled: {
      type: Date,
    },
    date_ended: {
      type: Date,
    },
    status: { 
      type: Boolean, 
      default: false,
    },
    blood_group: {
      type: String,
      trim: true,
    },
    genotype: {
      type: String,
      trim: true,
    },
    img:{
      url: String,       // Cloudinary URL
      publicId: String,  // Cloudinary Public ID
    },
    religion: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    lg: {
      type: String,
      trim: true,
    },
    tribe: {
      type: String,
      trim: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'School'
    },
    
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// LearnerSchema.virtual("url").get(function ()
// {
//   return `/admin/learner/${this._id}`;
// })

const Learner = mongoose.model("Learner", LearnerSchema);

module.exports = Learner;