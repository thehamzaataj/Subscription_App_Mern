const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  stripeCustomerId: { type: String },
  plan: { type: String },
  productLimit: { type: Number },
});

module.exports = mongoose.model('User', userSchema);
