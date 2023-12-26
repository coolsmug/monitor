const mongoose = require('mongoose');
const Schema = mongoose.Schema;

staffStatementSchema = new Schema ({
    excellent: {
        type: String,
        required: true,
        trim: true,
       },
    
      very_good: {
          type: String,
          required: true,
          trim: true,
        },
       
       good: {
          type: String,
          required: true,
          trim: true,
        },
        pass: {
          type: String,
          required: true,
          trim: true,
        },
        poor: {
          type: String,
          required: true,
          trim: true,
        },
        vpoor: {
          type: String,
          required: true,
          trim: true,
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
      { timestamps: true }
);

const Staffstatement = mongoose.model('Staffstatement', staffStatementSchema)
module.exports = Staffstatement;