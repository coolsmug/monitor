const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const staffSchema = new Schema ({
    roll: {
        type: String,
        required: true,
        trim: true,
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
        default: false
      },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'School'
      },
      
      password: {
        type: String,
        required: true,
      },
      email: {
        type: String,
       
        sparse: true,
      
        trim: true,
  
        minlength: 3,
  
        required: true,
      },
})

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;