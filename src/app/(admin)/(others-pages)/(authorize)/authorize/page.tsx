"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Input from "@/components/form/input/InputField";
import PaymentsTable from "@/components/tables/PaymentsTable";
import Swal from "sweetalert2";
import { Payment, PaymentStatus } from '@/app/types/types';

// interface Payment { 
//   firstName: string; 
//   lastName: string;
//   id: number; 
//   playerName: string;
//   playerImage: string; 
//   coachName: string;
//   coachImage: string;
//   evalId: number; 
//   amount: number | string;
//   status: "captured" | "authorized" | "canceled" | "failed" | "refunded";
//   created_at: string; 
//   updated_at: string; 
// }

const CapturedPaymentsPage = () => {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true); // ✅ Loading state
  const [refundDialog, setRefundDialog] = useState(false);
  // const [refundType, setRefundType] = useState<"full" | "partial" | null>(null);
  // const [partialAmount, setPartialAmount] = useState<number>(0);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [remark, setRemarks] = useState<string>('');
  const [internalRemark, setInternalRemark] = useState<string>('');

  // Fetch payments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // start spinner
      try {
        const res = await fetch("/api/authorize");
        const json = await res.json();
        const records = Array.isArray(json) ? json : json.data || [];
        setData(records);
      } catch (err) {
        console.error("Failed to fetch payments:", err);
        setData([]);
      } finally {
        setLoading(false); // stop spinner after fetch
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
      <h1 className="text-2xl font-bold mb-4">Authorize Payments</h1>

      <PaymentsTable
        data={data}
        onRefundClick={openRefundDialog}
        loading={loading} // pass loading prop
        paymentStatus={PaymentStatus.AUTHORIZED}
      />

      {/* Refund Dialog */}
      <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add a Comment</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            {/* Refund Type Selection */}
            {/* <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={refundType === "full"}
                onChange={() => {
                  setRefundType("full");
                  setPartialAmount(Number(selectedPayment?.amount || 0)); // Auto-fill full amount
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
                  setPartialAmount(0); // Reset partial amount
                }}
              />
              Partial Refund
            </label> */}

            {/* Amount Input */}
            {/* {(refundType === "partial" || refundType === "full") && (
              <Input
                type="number"
                placeholder={`Enter refund amount (max $${Number(selectedPayment?.amount || 0).toFixed(2)})`}
                value={partialAmount ? partialAmount.toString() : ""}
                onChange={(e) => setPartialAmount(Number(e.target.value))}
                min={(0).toString()}
                max={Number(selectedPayment?.amount || 0).toString()}
              />
            )} */}

            <Input
                type="textarea"
                placeholder={`Write your comment here...`}
                value={remark}
                onChange={(e) => setRemarks(e.target.value)}
              />

            <Input
                type="textarea"
                placeholder={`Write your internal comment here...`}
                value={internalRemark}
                onChange={(e) => setInternalRemark(e.target.value)}
              />

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setRefundDialog(false);
                  // setRefundType(null);
                  // setPartialAmount(0);
                  setSelectedPayment(null);
                }}
              >
                Cancel
              </Button>

              <Button
                onClick={async () => {
                  // if (!refundType) return;

                  // const amountToRefund = partialAmount;

                  // if (!amountToRefund || amountToRefund <= 0 || amountToRefund > Number(selectedPayment?.amount || 0)) {
                  //   Swal.fire({
                  //     icon: "error",
                  //     title: "Invalid Amount",
                  //     text: "Enter a valid refund amount.",
                  //   });
                  //   return;
                  // }

  // const { evaluation_id, remark } = await req.json();

                  const refundData = {
                    remark: remark,
                    internalRemark,
                    evaluation_id: selectedPayment?.evalId,
                  };

                  try {
                    const res = await fetch("/api/paymentcancel", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(refundData),
                    });

                    const data =  await res.json()

                    if (!res.ok) {
                      setRefundDialog(false);
                      // setRefundType(null);
                      // setPartialAmount(0);
                      setSelectedPayment(null);
                      setRemarks("");
                      throw new Error(data.error || "Failed to cancel payment");
                    }

                    Swal.fire({
                      icon: "success",
                      title: "Payment Cancelled Successful",
                      text: `Payment of $${selectedPayment?.amount} cancelled successfully!`,
                    });

                    // Reset dialog
                    setRefundDialog(false);
                    // setRefundType(null);
                    // setPartialAmount(0);
                    setSelectedPayment(null);
                    setRemarks("");


                    // Optionally refresh payments list
                    setLoading(true);
                    const refreshed = await fetch("/api/authorize");
                    const jsonRefreshed = await refreshed.json();
                    setData(Array.isArray(jsonRefreshed) ? jsonRefreshed : jsonRefreshed.data || []);
                    setLoading(false);

                  } catch (err) {
                    console.error(err);
                    Swal.fire({
                      icon: "error",
                      title: "Error",
                      text: `Failed to process refund due to this reason ${String(err)}. Please try again.`,
                    });
                  }
                }}
                disabled={!remark || !internalRemark}
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

export default CapturedPaymentsPage;
