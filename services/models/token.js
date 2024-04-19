const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoucherSchema = new Schema( {
    code: {
      type: String,
      required: true,
      unique: true

      },
      serial_no: {
        type: String,
        required: true
      },
      expiry: {
        type: Date,
        required: true
      },
      usage_count: {
        type: Number,
        default: 0
      },
      used: {
        type: Boolean,
        default: false
      },
      print: {
        type: Boolean,
        default: false
      },
      userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Learner',
      },
      schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School'
      },
      createdAt: {
        type: Date,
        default: Date.now // Set default value to the current date and time when the document is created
    }
})

const Voucher = mongoose.model('Voucher', VoucherSchema);

module.exports = Voucher;
