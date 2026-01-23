import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY || '';

const getStripe = (): Stripe | null => {
  if (!stripeKey) return null;
  return new Stripe(stripeKey);
};

export interface RegisterReaderParams {
  registrationCode: string;
  label: string;
  location?: string;
}

export interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  description?: string;
  readerId: string;
}

export const registerReader = async (params: RegisterReaderParams) => {
  const stripe = getStripe();
  if (!stripe) {
    return {
      id: `sim_reader_${Date.now()}`,
      object: 'terminal.reader',
      device_type: 'simulated',
      serial_number: `SIM-${params.registrationCode}`,
      label: params.label,
      status: 'online',
      location: params.location || ''
    };
  }

  const reader = await stripe.terminal.readers.create({
    registration_code: params.registrationCode,
    label: params.label,
    location: params.location
  });

  return reader;
};

export const deleteReader = async (stripeReaderId: string) => {
  const stripe = getStripe();
  if (!stripe) {
    return { id: stripeReaderId, deleted: true };
  }

  const deleted = await stripe.terminal.readers.del(stripeReaderId);
  return deleted;
};

export const createPaymentIntent = async (params: CreatePaymentIntentParams) => {
  const stripe = getStripe();
  if (!stripe) {
    return {
      id: `sim_pi_${Date.now()}`,
      amount: params.amount,
      currency: params.currency || 'usd',
      status: 'requires_payment_method',
      description: params.description || '',
      client_secret: `sim_secret_${Date.now()}`
    };
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency || 'usd',
    description: params.description,
    payment_method_types: ['card_present'],
    capture_method: 'automatic'
  });

  await stripe.terminal.readers.processPaymentIntent(params.readerId, {
    payment_intent: paymentIntent.id
  });

  return paymentIntent;
};

export const listReaders = async () => {
  const stripe = getStripe();
  if (!stripe) {
    return [];
  }

  const readers = await stripe.terminal.readers.list({ limit: 100 });
  return readers.data;
};
