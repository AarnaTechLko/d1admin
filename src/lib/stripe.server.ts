import Stripe from 'stripe';

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY at runtime');
  }
  //Creates an instance of stripe that is returned to be used for financial purposes
  return new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia',
  });
}