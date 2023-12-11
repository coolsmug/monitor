const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CurrentClassSchema = new Schema ({
     roll_no: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },

    arm: {
        type: String,
        required: true,
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'School'
      },
    class_code: {
        type: String,
        required: true,
        trim: true,
    },

    capacity: {
        type: String,
    },
    
    status: {
        type: String,
        required:true,
    },

    datenow :{
        type: Date,
        default: Date.now,
    },

},
 { timestamps: true }
 );

 const currentClass = mongoose.model("Currentclass", CurrentClassSchema);
 module.exports =   currentClass;