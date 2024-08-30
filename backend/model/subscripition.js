// models/subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, required: true },
  productLimit: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
