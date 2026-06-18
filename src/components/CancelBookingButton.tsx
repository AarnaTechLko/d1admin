// Updated CancelBookingButton.tsx with success/error modals and page reload

"use client";

import { useState } from "react";

interface Props {
  bookingId: number;
  previousStatus: string;
  adminUserId: number;
  onCancelled?: () => void;
}

export function CancelBookingButton({
  bookingId,
  previousStatus,
  adminUserId,
  onCancelled,
}: Props) {
  const [step, setStep] = useState<"idle" | "confirm" | "modal" | "success" | "error">("idle");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");

  const isCancelled = previousStatus === "cancelled";

  const handleCancelClick = () => {
    if (isCancelled) return;
    setStep("confirm");
  };

  const handleConfirm = () => {
    setReason("");
    setError("");
    setStep("modal");
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason before cancelling.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/bookings/${bookingId}/cancellation-reason`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "cancelled",
            reason: reason.trim(),
            changed_by_user_id: adminUserId,
            changed_by_user_type: "admin",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        setApiError(data.message ?? "Something went wrong. Please try again.");
        setStep("error");
        return;
      }

      setStep("success");
      onCancelled?.();
    } catch (err: unknown) {
      console.error(err);
      setApiError("Network error. Please check your connection and try again.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setStep("idle");
    window.location.reload();
  };

  const handleErrorClose = () => {
    setStep("modal"); // go back to modal so user can retry
  };

  return (
    <>
      {/* ── Cancel button ───────────────────────────────────────────────── */}
      <button
        onClick={handleCancelClick}
        disabled={isCancelled}
        className="inline-flex items-center gap-1.5 rounded-md border bg-gray-300 px-2 py-1.5 text-xs font-xs text-gray-500 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isCancelled ? "Cancelled" : "Cancel"}
      </button>

      {/* ── Confirmation dialog ─────────────────────────────────────────── */}
      {step === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 w-full max-w-sm p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex flex-col gap-2">
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                Cancel this booking?
              </p>
              <p className="text-sm text-zinc-500 leading-relaxed">
                This will cancel booking{" "}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  #{bookingId}
                </span>{" "}
                release the player&apos;s payment hold. This cannot be undone.    
                          </p>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setStep("idle")}
                className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Keep booking
              </button>
              <button
                onClick={handleConfirm}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Yes, cancel it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancellation reason modal ───────────────────────────────────── */}
      {step === "modal" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 w-full max-w-md shadow-xl overflow-hidden">
            {/* header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <span className="text-red-600 text-lg">✕</span>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Cancel booking #{bookingId}
                </p>
                <p className="text-xs text-zinc-400">
                  Logged to the audit trail
                </p>
              </div>
            </div>

            {/* body */}
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (e.target.value.trim()) setError("");
                  }}
                  maxLength={300}
                  rows={3}
                  placeholder="e.g. Player requested cancellation due to scheduling conflict…"
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
                <div className="flex justify-between">
                  {error ? (
                    <span className="text-xs text-red-500">{error}</span>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-zinc-400">
                    {reason.length} / 300
                  </span>
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setStep("idle")}
                disabled={loading}
                className="rounded-md border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {loading ? "Cancelling…" : "Confirm cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success modal ───────────────────────────────────────────────── */}
      {step === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 w-full max-w-sm p-6 flex flex-col items-center gap-4 shadow-xl text-center">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center">
              <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {/* Text */}
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Booking cancelled
              </p>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Booking{" "}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  #{bookingId}
                </span>{" "}
                has been successfully cancelled .
              </p>
            </div>
            {/* Action */}
            <button
              onClick={handleSuccessClose}
              className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── Error modal ─────────────────────────────────────────────────── */}
      {step === "error" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 w-full max-w-sm p-6 flex flex-col items-center gap-4 shadow-xl text-center">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            {/* Text */}
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Cancellation failed
              </p>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {apiError}
              </p>
            </div>
            {/* Actions */}
            <div className="flex w-full gap-2">
              <button
                onClick={() => setStep("idle")}
                className="flex-1 rounded-md border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleErrorClose}
                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}