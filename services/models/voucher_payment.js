const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    pin: { type: String, required: true },
    status: { type: String, default: 'pending' },
    reference: {
        type: String,
        required: true
    },
    used: {
        type: Boolean,
        default: false
      }
}, { timestamps: true })

const VoucherPayment = mongoose.model('voucherpayment', paymentSchema )

module.exports = VoucherPayment;