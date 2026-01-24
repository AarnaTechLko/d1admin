'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PaymentPage from '../../../../components/PaymentPage';

function PaymentContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');

  if (!paymentId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Payment Request</h1>
          <p className="text-gray-600">Missing payment ID.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <PaymentPage paymentId={paymentId} />
    </div>
  );
}

export default function Payment() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}