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
      classId: [
        String
      ],
      password: {
        type: String,
        required: true,
      },
      mobile_phone: {
        type: String,
      },
      address : {
        type: String,
      },
      email: {
        type: String,
       
        sparse: true,
      
        trim: true,
  
        minlength: 3,
  
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now // Set default value to the current date and time when the document is created
    }
})

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;