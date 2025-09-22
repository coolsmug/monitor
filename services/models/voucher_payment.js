const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  pin: { type: String, required: true, unique: true },
  status: { type: String, default: 'pending' },
  reference: { type: String, required: true },
  expiresAt: { type: Date, required: true }, // for TTL
  used: { type: Boolean, default: false },
  number: { type: Number, required: true }, // number of pages
}, { timestamps: true });

// TTL Index: auto delete after expiresAt
paymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const VoucherPayment = mongoose.model('VoucherPayment', paymentSchema);
module.exports = VoucherPayment;
