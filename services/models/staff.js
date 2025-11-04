// models/Staff.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const staffSchema = new Schema({
  admin_no: { type: String, trim: true },
  roll: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  position: { type: String, trim: true },
  status: { type: Boolean, default: false },
  isStaff: { type: Boolean, default: false },
  schoolId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'School' },
  classId: [String],
  password: { type: String, trim: true },
  about: { type: String, trim: true },
  subject: { type: String, trim: true },
  mobile_phone: { type: String, trim: true },
  award: [String],
  address: { type: String, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    validate: {
      validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: props => `${props.value} is not a valid email!`
    }
  },
 
    x: { type: String, trim: true },
    instagram: { type: String, trim: true },
    facebook: { type: String, trim: true },
    linkedin: { type: String, trim: true },
  
 img: {
  url: String,          
  publicId: String,    
},
faceEmbedding: {
    type: [Number],
    default: [],
  },
  createdAt: { type: Date, default: Date.now }
});

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;
