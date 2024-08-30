import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import './App.css'
const stripePromise = loadStripe('pk_test_51PIDkmAmRjLguYXEQDqNDPDnOei1uubOLW6RktJUbhZLqk5AlQ4ThEl1j9YiusDj6lyHapphGkVXYbBqkQa6Q02o0032ODFL9G');

const App = () => {
  const handleCheckout = async (plan) => {
    try {
      const { data } = await axios.post('https://subscription-app-mern.vercel.app/api/subscriptions/create-checkout-session', { plan });
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  return (
    <div className='main'>
      <h1 >Subscribe to a Plan</h1>
      <button className='qw' onClick={() => handleCheckout('basic')}>Basic - $10</button>
      <button className='qw' onClick={() => handleCheckout('standard')}>Standard - $20</button>
      <button className='qw' onClick={() => handleCheckout('premium')}>Premium - $50</button>
    </div>
  );
};

export default App;
