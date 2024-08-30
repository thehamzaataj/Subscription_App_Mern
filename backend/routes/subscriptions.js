const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_51PIDkmAmRjLguYXEzKIsY5S7wbSADPoY5LpbGgiLl6o5o3SMV5COTPdv9ZdrpOr8YA7qe2UqXAv94NJwpuMZBDYG00d3XTy47Q');
const User = require('../model/user');
const Subscription = require('../model/subscripition');

// Define subscription plans
const plans = {
  basic: { price: 1000, limit: 2 },
  standard: { price: 2000, limit: 5 },
  premium: { price: 5000, limit: 10 }
};

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  const { plan, userId } = req.body;
  if (!plans[plan]) return res.status(400).send('Invalid plan');

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
            },
            unit_amount: plans[plan].price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        userId: userId, // Ensure you pass userId from frontend
        plan: plan,
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Webhook endpoint to handle Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = 'we_1PqCLRAmRjLguYXEHKqviwR5';

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    try {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); 

      // Update user subscription
      await User.findByIdAndUpdate(userId, { plan, productLimit: plans[plan].limit });

      // Create a new subscription record
      await Subscription.create({
        userId,
        plan,
        productLimit: plans[plan].limit,
        startDate: new Date(),
        expiryDate: expiryDate,
      });

      console.log(`Subscription created for user ${userId} with plan: ${plan}`);
    } catch (err) {
      console.error(`Error updating user or creating subscription: ${err.message}`);
    }
  }

  res.status(200).send('Event received');
});

// Function to check for expired subscriptions
const checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    const expiredSubscriptions = await Subscription.find({ expiryDate: { $lt: now } });

    for (const subscription of expiredSubscriptions) {
      await User.findByIdAndUpdate(subscription.userId, { plan: null, productLimit: 0 }); // Reset user plan and limit
      await Subscription.findByIdAndDelete(subscription._id); // Delete expired subscription
      console.log(`Subscription expired and removed for user ${subscription.userId}`);
    }
  } catch (err) {
    console.error(`Error checking expired subscriptions: ${err.message}`);
  }
};

// Schedule the check to run periodically, e.g., daily
const scheduleDailyCheck = () => {
  setInterval(checkExpiredSubscriptions, 24 * 60 * 60 * 1000); // Every 24 hours
};

// Start the scheduled check
scheduleDailyCheck();

module.exports = router;
