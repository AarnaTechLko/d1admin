// components/RescheduleBookingButton.tsx
"use client";

import { useState, useEffect } from "react";
type RescheduleStep = "idle" | "slots" | "confirm" | "success" | "error";

interface Slot {
    id: number;
    coachId: number;
    date: string;
    startTime: string;   // ISO timestamp
    endTime: string;     // ISO timestamp
}
interface Props {
    bookingId: number;
    coachId: number;
    previousStatus: string;
    adminUserId: number;
    onRescheduled?: () => void;
}

export function RescheduleBookingButton({
    bookingId,
    coachId,
    previousStatus,
    adminUserId,
    onRescheduled,
}: Props) {
    const [step, setStep] = useState<RescheduleStep>("idle");

    const [slots, setSlots] = useState<Slot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [error, setError] = useState("");
    const [apiError, setApiError] = useState("");

    const isDisabled = ["cancelled", "declined", "accepted"].includes(previousStatus);

    // ── Fetch available slots when modal opens ─────────────────────────────
    useEffect(() => {
        if (step !== "slots") return;

        const fetchSlots = async () => {
            setSlotsLoading(true);
            try {
                const res = await fetch(
                    `/api/coach/${coachId}/available-slots?bookingId=${bookingId}`
                );
                const data = await res.json();
                console.log("🔵 Available slots response:", data); // debug log
                if (!res.ok) throw new Error(data.message ?? "Failed to fetch slots");
                setSlots(data.slots ?? []);
            } catch (err: unknown) {
                const message =
                    err instanceof Error ? err.message : "Could not load available slots.";

                setApiError(message);
                setStep("error");
            } finally {
                setSlotsLoading(false);
            }
        };

        fetchSlots();
    }, [step, coachId, bookingId]);

    // ── Step 1: Open slot picker ───────────────────────────────────────────
    const handleOpen = () => {
        if (isDisabled) return;
        setSelectedSlot(null);
        setReason("");
        setError("");
        setStep("slots");
    };

    // ── Step 2: Go to confirm ──────────────────────────────────────────────
    const handleNext = () => {
        if (!selectedSlot) {
            setError("Please select a time slot.");
            return;
        }
        setError("");
        setStep("confirm");
    };

    // ── Step 3: Submit reschedule ──────────────────────────────────────────
    const handleSubmit = async () => {
        if (!reason.trim()) {
            setError("Please provide a reason before rescheduling.");
            return;
        }
        if (!selectedSlot) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/bookings/${bookingId}/reschedule`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    availability_id: selectedSlot.id,
                    start_time: selectedSlot.startTime,
                    end_time: selectedSlot.endTime,
                    previous_status: previousStatus,
                    changed_by_user_id: adminUserId,
                    changed_by_user_type: "admin",
                    reason: reason.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setApiError(data.message ?? "Something went wrong.");
                setStep("error");
                return;
            }

            setStep("success");
            onRescheduled?.();
        } catch {
            setApiError("Network error. Please try again.");
            setStep("error");
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessClose = () => {
        setStep("idle");
        window.location.reload();
    };
    const formatSlot = (slot: Slot) => {
        const date = new Date(slot.date).toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            timeZone: "Asia/Kolkata",  // ← UTC ki jagah IST
        });

        const start = new Date(slot.startTime).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Kolkata",  // ← UTC ki jagah IST
        });

        const end = new Date(slot.endTime).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Kolkata",  // ← UTC ki jagah IST
        });

        return `${date} · ${start} – ${end}`;
    };


    return (
        <>
            {/* ── Reschedule button ──────────────────────────────────────────── */}
            <button
                onClick={handleOpen}
                disabled={isDisabled}
                className="inline-flex items-center gap-1.5 rounded-md border bg-blue-200 px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Reschedule
            </button>

            {/* ── Slot picker modal ──────────────────────────────────────────── */}
            {step === "slots" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 w-full max-w-md shadow-xl overflow-hidden">
                        {/* header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                <span className="text-blue-600 text-lg">↻</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                    Reschedule booking #{bookingId}
                                </p>
                                <p className="text-xs text-zinc-400">
                                    Pick a new available slot for the coach
                                </p>
                            </div>
                        </div>

                        {/* body */}
                        <div className="px-5 py-4 flex flex-col gap-3 max-h-72 overflow-y-auto">
                            {slotsLoading ? (
                                <div className="flex items-center justify-center py-8 gap-2 text-sm text-zinc-400">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
                                    Loading available slots…
                                </div>
                            ) : slots.length === 0 ? (
                                <p className="text-sm text-zinc-500 text-center py-8">
                                    No available slots found for this coach.
                                </p>
                            ) : (
                                slots.map((slot) => (
                                    <label
                                        key={slot.id}
                                        className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${selectedSlot?.id === slot.id
                                            ? "border-blue-400 bg-blue-50 dark:bg-blue-950 dark:border-blue-600"
                                            : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="slot"
                                            value={slot.id}
                                            checked={selectedSlot?.id === slot.id}
                                            onChange={() => {
                                                setSelectedSlot(slot);
                                                setError("");
                                            }}
                                            className="accent-blue-600"
                                        />
                                        <span className="text-sm text-zinc-800 dark:text-zinc-200">
                                            {formatSlot(slot)}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>

                        {/* error */}
                        {error && (
                            <p className="px-5 text-xs text-red-500">{error}</p>
                        )}

                        {/* footer */}
                        <div className="flex justify-end gap-2 px-5 py-4 border-t border-zinc-100 dark:border-zinc-800">
                            <button
                                onClick={() => setStep("idle")}
                                className="rounded-md border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!selectedSlot || slotsLoading}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Confirm + reason modal ─────────────────────────────────────── */}
            {step === "confirm" && selectedSlot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 w-full max-w-md shadow-xl overflow-hidden">
                        {/* header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                <span className="text-blue-600 text-lg">↻</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                    Confirm reschedule
                                </p>
                                <p className="text-xs text-zinc-400">Logged to the audit trail</p>
                            </div>
                        </div>

                        {/* body */}
                        <div className="px-5 py-4 flex flex-col gap-4">
                            {/* new slot summary */}
                            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 px-4 py-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-blue-500 mb-1">
                                    New time slot
                                </p>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                    {formatSlot(selectedSlot)}
                                </p>
                            </div>

                            {/* reason */}
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
                                    placeholder="e.g. Player requested a different time due to schedule conflict…"
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
                                onClick={() => setStep("slots")}
                                disabled={loading}
                                className="rounded-md border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading && (
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                )}
                                {loading ? "Rescheduling…" : "Confirm reschedule"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Success modal ──────────────────────────────────────────────── */}
            {step === "success" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 w-full max-w-sm p-6 flex flex-col items-center gap-4 shadow-xl text-center">
                        <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center">
                            <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                Booking rescheduled
                            </p>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                Booking{" "}
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                    #{bookingId}
                                </span>{" "}
                                has been moved to the new slot. Status is now{" "}
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                    requested
                                </span>{" "}
                                — coach will need to re-confirm.
                            </p>
                        </div>
                        <button
                            onClick={handleSuccessClose}
                            className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            {/* ── Error modal ────────────────────────────────────────────────── */}
            {step === "error" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 w-full max-w-sm p-6 flex flex-col items-center gap-4 shadow-xl text-center">
                        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
                            <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                Reschedule failed
                            </p>
                            <p className="text-sm text-zinc-500 leading-relaxed">{apiError}</p>
                        </div>
                        <div className="flex w-full gap-2">
                            <button
                                onClick={() => setStep("idle")}
                                className="flex-1 rounded-md border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={() => setStep("slots")}
                                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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