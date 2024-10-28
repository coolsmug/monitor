const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const staffSchema = new Schema({
  roll: {
    type: String,
    required: true,
    trim: true,  // Removes surrounding whitespace
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  isStaff: {
    type: Boolean,
    default: false,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'School',  // Reference to the School model
  },
  classId: [
    String,  // Array of strings; if this references another model, change to ObjectId
  ],
  password: {
    type: String,
    required: true,
  },
  mobile_phone: {
    type: String,
    trim: true,  // Trims whitespace
    validate: {
      validator: function (v) {
        return /\d{10,15}/.test(v);  // Example regex for validating phone numbers
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  address: {
    type: String,
    trim: true,  // Trims whitespace from addresses
  },
  email: {
    type: String,
    required: true,
    unique: true,  // Ensures emails are unique
    sparse: true,  // Allows some records to have no email if needed (but combined with `required: true`, it might not be necessary)
    trim: true,
    minlength: 3,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);  // Simple email regex for validation
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  img: {
    url: String,  // Cloudinary image URL
    publicId: String,  // Cloudinary public ID for image management
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;
