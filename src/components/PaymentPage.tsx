'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

import Swal from "sweetalert2";


const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface PaymentData {
  evaluationId: number;
  coachId: number;
  playerId: number;
  originalAmount: number;
  currentAmount: number;
  paymentId: number;
  appliedCoupon?: CouponData | null;
}

interface PaymentPageProps {
  paymentId: string;
}

interface CouponData {
  id: number;
  name: string;
  discount: number;
  count: number;
}

function CheckoutForm({
  evaluationId,
  coachId,
  playerId,
  originalAmount,
  currentAmount,
  paymentId,
  appliedCoupon,
}: PaymentData) {
  const stripe = useStripe();
  const elements = useElements();
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<CouponData | null>(appliedCoupon || null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalAmount, setFinalAmount] = useState(currentAmount);

  // Set coupon code if coupon is already applied
  useEffect(() => {
    if (appliedCoupon) {
      setCouponCode(''); // Don't show the actual code for security
    }
  }, [appliedCoupon]);


  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError('');

    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: couponCode.trim(), coachId }),
      });

      const data = await response.json();

      if (response.ok) {
        setCouponData(data.coupon);
        // Calculate discount from original amount
        const discountAmount =
          (originalAmount * Number(data.coupon.discount)) / 100;
        const newAmount = originalAmount - discountAmount;
        
        if (newAmount < 0.5) {
          setCouponError('Discount cannot reduce amount below $0.50');
          setCouponData(null);
          setFinalAmount(originalAmount);
          return;
        }
        
        setFinalAmount(newAmount);
      } else {
        setCouponError(data.error || 'Invalid coupon code');
        setCouponData(null);
        setFinalAmount(originalAmount);
      }
    } catch (error) {

      console.log("Error: ", String(error));

      setCouponError('Failed to validate coupon');
      setCouponData(null);
      setFinalAmount(originalAmount);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponData(null);
    setCouponError('');
    setFinalAmount(originalAmount);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error('Elements submit failed:', submitError);
        setIsProcessing(false);
        return;
      }

      // Create fresh PaymentIntent with final amount
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          captureMethod: 'manual',
          evaluationId,
          coachId,
          playerId,
          paymentId,
          couponId: couponData?.id || null,
        }),
      });
      
      const { clientSecret } = await response.json();

      const returnUrl = couponData
        ? `${window.location.origin}/paymentDone?success=true&couponId=${couponData.id}&playerId=${playerId}`
        : `${window.location.origin}/paymentDone?success=true&playerId=${playerId}`;

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: returnUrl,
        },
      });

      if (error) {
        console.error('Payment failed:', error);
      }
    } catch (error) {
      console.error('Payment creation failed:', error);
        Swal.fire("Error", String(error), "error");

    } finally {
      setIsProcessing(false);
    }
  };

  const discountAmount = couponData
    ? (originalAmount * Number(couponData.discount)) / 100
    : 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-lg"
    >
      <h2 className="mb-6 text-2xl font-bold">Payment Details</h2>

      {/* Price Summary */}
      <div className="mb-6 rounded bg-gray-50 p-4">
        <div className="mb-2 flex justify-between">
          <span>Original Amount:</span>
          <span>${originalAmount.toFixed(2)}</span>
        </div>

        {couponData && (
          <>
            <div className="mb-2 flex justify-between text-green-600">
              <span>Discount ({couponData.discount}%):</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
            <hr className="my-2" />
          </>
        )}

        <div className="flex justify-between text-lg font-bold">
          <span>Final Amount:</span>
          <span>${finalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Coupon Section */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">
          Coupon Code (Optional)
        </label>

        {!couponData ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isValidatingCoupon}
            />
            <button
              onClick={validateCoupon}
              disabled={isValidatingCoupon}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {isValidatingCoupon ? 'Validating...' : 'Apply'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded border border-green-200 bg-green-50 p-3">
            <div>
              <span className="font-medium text-green-800">
                {couponData.name}
              </span>
              <span className="ml-2 text-sm text-green-600">
                ({couponData.discount}% off)
              </span>
            </div>
            <button
              onClick={removeCoupon}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        )}

        {couponError && (
          <p className="mt-1 text-sm text-red-500">{couponError}</p>
        )}
      </div>

      {/* Stripe Payment Element */}
      <div className="mb-6">
        <PaymentElement
          options={{
            wallets: {
              applePay: 'auto',
              googlePay: 'never',
            },
          }}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full rounded-lg bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : 'Submit Payment'}
      </button>
    </form>
  );
}

export default function PaymentPage({ paymentId }: PaymentPageProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    fetchPaymentData();
  }, [paymentId]);

  const fetchPaymentData = async () => {
    const response = await fetch(`/api/payment-data?paymentId=${paymentId}`);
    const data = await response.json();
    setPaymentData(data);
  };

  if (!paymentData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 py-8">
        Loading...
      </div>
    );
  }

  const options = {
    mode: 'payment' as const,
    currency: 'usd',
    amount: Math.round(paymentData.originalAmount * 100),
    captureMethod: 'manual' as const,
    paymentMethodTypes: ['card'],
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm {...paymentData} />
    </Elements>
  );
}
