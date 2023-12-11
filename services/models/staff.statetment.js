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
        }
      },
      { timestamps: true }
);

const Staffstatement = mongoose.model('Staffstatement', staffStatementSchema)
module.exports = Staffstatement;