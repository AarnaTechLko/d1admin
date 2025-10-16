"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Input from "@/components/form/input/InputField";
import PaymentsTable from "@/components/tables/PaymentsTable";
import Swal from "sweetalert2";

interface Payment {
  firstName: string;
  lastName: string;
  id: number;
  playerName: string;
  playerImage: string;
  coachName: string;
  coachImage: string;
  evalId: number;
  amount: number | string;
  status: "captured" | "authorized" | "canceled" | "failed" | "refunded";
  created_at: string;
  updated_at: string;
}

const RefundedPaymentsPage = () => {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refundDialog, setRefundDialog] = useState(false);
  const [refundType, setRefundType] = useState<"full" | "partial" | null>(null);
  const [partialAmount, setPartialAmount] = useState<number>(0);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Fetch refunded payments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/refunded"); // ✅ fetch refunded payments
        const json = await res.json();
        const records = Array.isArray(json) ? json : json.data || [];
        setData(records);
      } catch (err) {
        console.error("Failed to fetch refunded payments:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openRefundDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setRefundDialog(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Refunded Payments</h1>

      {/* Payments Table with loading state */}
      <PaymentsTable
        data={data}
        onRefundClick={openRefundDialog} // optional, can disable if refunded payments are non-refundable
        loading={loading}
      />

      {/* Refund Dialog (optional for refunded payments) */}
      <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Refund Payment</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={refundType === "full"}
                onChange={() => {
                  setRefundType("full");
                  setPartialAmount(Number(selectedPayment?.amount || 0));
                }}
              />
              Full Refund
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={refundType === "partial"}
                onChange={() => {
                  setRefundType("partial");
                  setPartialAmount(0);
                }}
              />
              Partial Refund
            </label>

            {(refundType === "partial" || refundType === "full") && (
              <Input
                type="number"
                placeholder={`Enter refund amount (max $${Number(selectedPayment?.amount || 0).toFixed(2)})`}
                value={partialAmount ? partialAmount.toString() : ""}
                onChange={(e) => setPartialAmount(Number(e.target.value))}
                min="0"
                max={Number(selectedPayment?.amount || 0).toString()}
              />
            )}

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setRefundDialog(false);
                  setRefundType(null);
                  setPartialAmount(0);
                  setSelectedPayment(null);
                }}
              >
                Cancel
              </Button>

              <Button
                onClick={async () => {
                  if (!refundType) return;

                  const amountToRefund = partialAmount;

                  if (!amountToRefund || amountToRefund <= 0 || amountToRefund > Number(selectedPayment?.amount || 0)) {
                    Swal.fire({
                      icon: "error",
                      title: "Invalid Amount",
                      text: "Enter a valid refund amount.",
                    });
                    return;
                  }

                  const refundData = {
                    payment_id: selectedPayment?.id,
                    refund_type: refundType,
                    amount_refunded: amountToRefund,
                    remaining_amount: Number(selectedPayment?.amount || 0) - amountToRefund,
                    refund_by: "Admin",
                  };

                  try {
                    const res = await fetch("/api/refunds", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(refundData),
                    });

                    if (!res.ok) throw new Error("Failed to create refund");

                    Swal.fire({
                      icon: "success",
                      title: "Refund Successful",
                      text: `Refund of $${amountToRefund.toFixed(2)} processed successfully!`,
                    });

                    setRefundDialog(false);
                    setRefundType(null);
                    setPartialAmount(0);
                    setSelectedPayment(null);
                  } catch (err) {
                    console.error(err);
                    Swal.fire({
                      icon: "error",
                      title: "Error",
                      text: "Failed to process refund. Please try again.",
                    });
                  }
                }}
                disabled={!refundType}
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RefundedPaymentsPage;
