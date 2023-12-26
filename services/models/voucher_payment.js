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
      },
      createdAt: {
        type: Date,
        default: Date.now // Set default value to the current date and time when the document is created
    }
}, { timestamps: true })

const VoucherPayment = mongoose.model('voucherpayment', paymentSchema )

module.exports = VoucherPayment;