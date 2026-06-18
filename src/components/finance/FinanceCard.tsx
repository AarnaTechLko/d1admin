'use client';

import { useEffect, useState } from 'react';
import { PaymentStatus } from '@/app/types/types';

interface FinanceSummary {
  totalVideoPayment: number;
  totalEvaluationPayment: number;
  totalCombined: number;
  totalCompanyRevenue: number;
  totalRecords: number;
}

interface Payment {
  status: PaymentStatus;
  amount: number;
}

type FinanceCardsProps =
  | { playerId: number; coachId?: never }
  | { coachId: number; playerId?: never };

export default function FinanceCards({ playerId, coachId }: FinanceCardsProps) {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Determines if this is a player view
  const isPlayer = !!playerId;

  useEffect(() => {
    const id = playerId ?? coachId;
    if (!id) return;

    const url = playerId
      ? `/api/video-payments/player/${playerId}`
      : `/api/video-payments/coach/${coachId}`;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch finance data');

        const data = await res.json();

        if (data.success) {
          setSummary(data.summary);
          setPayments(data.payments ?? []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [playerId, coachId]);

  const cancelledRecords = payments.filter(
    (p) =>
      p.status === PaymentStatus.REFUNDED ||
      p.status === PaymentStatus.CANCELLED ||
      p.status === PaymentStatus.FAILED
  );
  const totalCancellationsCount = cancelledRecords.length;
  const totalCancellationsAmount = cancelledRecords.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );
  const cancellationRatio =
    payments.length
      ? ((totalCancellationsCount / payments.length) * 100).toFixed(1)
      : '0.0';

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const totalVideoEarnings = summary?.totalVideoPayment ?? 0;
  const totalEvaluationEarnings = summary?.totalEvaluationPayment ?? 0;
  const grossEarnings = summary?.totalCombined ?? 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-20 animate-pulse bg-gray-50"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 p-3 rounded-xl border border-red-100 bg-red-50 text-red-600 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">

      {/* Video Earnings / Spent */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-2">
        <div className="bg-blue-50 text-blue-500 rounded-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            {isPlayer ? 'Video Spent' : 'Video Earnings'}
          </p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(totalVideoEarnings)}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{summary?.totalRecords ?? 0} records</p>
        </div>
      </div>

      {/* Evaluation Earnings / Spent */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-2">
        <div className="bg-green-50 text-green-500 rounded-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            {isPlayer ? 'Evaluation Spent' : 'Evaluation Earnings'}
          </p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(totalEvaluationEarnings)}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{isPlayer ? 'Paid by player' : 'Net to coaches'}</p>
        </div>
      </div>

      {/* Gross Earnings / Spent */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-2">
        <div className="bg-yellow-50 text-yellow-500 rounded-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            {isPlayer ? 'Gross Spent' : 'Gross Earnings'}
          </p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(grossEarnings)}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Video + Evaluation</p>
        </div>
      </div>

      {/* Cancellations */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-2">
        <div className="bg-red-50 text-red-500 rounded-2xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">Video Cancellations</p>
          <div className="grid grid-cols-3 gap-1 text-center border-t pt-2 border-gray-50">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">Total</span>
              <span className="text-base font-black text-gray-900">{totalCancellationsCount}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">Ratio</span>
              <span className="text-base font-black text-red-500">{cancellationRatio}%</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">Amount</span>
              <span className="text-base font-black text-red-500">{formatCurrency(totalCancellationsAmount)}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}