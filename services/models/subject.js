const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const subjectSchema = new Schema ({
    roll_no: {
        type: Number,
        required: true,
    },
    name: {
       type: String,
        required: true,
    },

    category: { 
        type: String,
        required: true,
    },

    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'School'
      },
      createdAt: {
        type: Date,
        default: Date.now // Set default value to the current date and time when the document is created
    }

},
{ timestamps: true}
);

subjectSchema.virtual('url').get(function ()
{
    return `/class/subject/${this._id}`;
})

const Subject = mongoose.model("Subject", subjectSchema)
module.exports = Subject