'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PaymentDetails {
  payment_status: string;
  amount_total: number;
  currency: string;
  customer_email: string;
  payment_intent: string;
}

// Properly typed page props for Next.js app router
interface PaymentDonePageProps {
  searchParams?: Promise<{
    success?: string;
    redirect_status?: string;
    payment_intent?: string;
    playerId?: string;
  }>;
}

export default function PaymentDonePage({ searchParams }: PaymentDonePageProps) {
  const router = useRouter();
  const [params, setParams] = useState<{
    success?: string;
    redirect_status?: string;
    payment_intent?: string;
    playerId?: string;
  }>({});
  
  useEffect(() => {
    if (searchParams) {
      searchParams.then(setParams);
    }
  }, [searchParams]);
  
  const { success, redirect_status, payment_intent, playerId } = params;
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (success === 'true' || redirect_status === 'succeeded' || payment_intent) {
      setPaymentDetails({
        payment_status: 'succeeded',
        amount_total: 0,
        currency: 'usd',
        customer_email: '',
        payment_intent: payment_intent || ''
      });

      if (payment_intent) {
        const urlParams = new URLSearchParams(window.location.search);
        const couponId = urlParams.get('couponId');

        fetch('/api/payment-success-fallback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: payment_intent,
            couponId: couponId ? Number(couponId) : null
          })
        })
          .then(res => res.json())
          .then(data => console.log('Fallback API response:', data))
          .catch(err => console.error('Fallback API error:', err));
      }

      return;
    }

    setError('Error: Payment confirmation missing');
  }, [success, redirect_status, payment_intent]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded border border-red-300 bg-red-100 p-4 text-red-800 shadow">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="flex h-screen items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-100 to-white px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-green-200 bg-white p-8 text-center shadow-lg sm:p-12">
        <img
          src="/images/paymenrSuccess1.gif"
          alt="Payment Success"
          className="mx-auto h-40 w-40"
        />

        <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
        <p className="text-sm text-gray-600">
          Thank you for your payment. Your transaction has been processed successfully.
        </p>

        <button
          onClick={() => router.push(playerId ? `/player/${playerId}` : '/player')}
          className="rounded-xl bg-green-500 px-6 py-2 font-semibold text-white transition duration-300 hover:bg-green-600"
        >
          Go Back to Player
        </button>
      </div>
    </div>
  );
}
