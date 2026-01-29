"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Input from "@/components/form/input/InputField";
import PaymentsTable from "@/components/tables/PaymentsTable";
import Swal from "sweetalert2";
import { Payment, PaymentStatus } from '@/app/types/types';
import PaymentActionLog from "@/components/PaymentActionLog";

// interface Payment { 
//     firstName: string; 
//     lastName: string;
//     id: number; 
//     playerName: string;
//     playerImage: string; 
//     coachName: string;
//     coachImage: string;
//     evalId: number; 
//     amount: number | string;
//     status: "captured" | "authorized" | "canceled" | "failed"|"refunded";
//     created_at: string; 
//     updated_at: string; 
//   }

const CapturedPaymentsPage = () => {
     const [loading, setLoading] = useState(true); // ✅ Loading state
    const [data, setData] = useState<Payment[]>([]);
    const [refundDialog, setRefundDialog] = useState(false);
    const [refundType, setRefundType] = useState<"full" | "fee" | "partial" | null>(null);
    const [partialAmount, setPartialAmount] = useState<string>("");
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [internalRemark, setInternalRemark] = useState<string>('');
    const [remark, setRemarks] = useState<string>('');
    const [paymentId, setPaymentId] = useState<number>(0);
    const [commentModal, setCommentModal] = useState(false);

    // Fetch payments
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // start spinner
            try {
                const res = await fetch("/api/captured");
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

    const closeAdminLogs = () => {
      setCommentModal(false);
    };

    const openCommentModal = (payment_id: number) => {
      console.log("payment_id", payment_id);
      setCommentModal(true);
      setPaymentId(payment_id);  
    }
    

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Captured Payments</h1>

            <PaymentsTable
              data={data}
              onRefundClick={openRefundDialog}
              onCommentClick={openCommentModal}
              loading={loading} // pass loading prop
              paymentStatus={PaymentStatus.CAPTURED}
            />

          <PaymentActionLog
            payment_id={paymentId}
            commentModal={commentModal}
            onClose={closeAdminLogs}
          />


           {/* Refund Dialog */}
      <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Refund Payment</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            {/* Refund Type Selection */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={refundType === "full"}
                onChange={() => {
                  setRefundType("full");
                  setPartialAmount(String(selectedPayment?.amount || "")); // Auto-fill full amount
                }}
              />
              Full Refund
            </label>

            {/* <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={refundType === "fee"}
                onChange={() => {
                  setRefundType("fee");
                  setPartialAmount(String(selectedPayment?.processed_amount || "")); // Auto-fill full amount after fees
                }}
              />
              Full Refund After Fees
            </label> */}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={refundType === "partial"}
                onChange={() => {
                  setRefundType("partial");
                  setPartialAmount(""); // Reset partial amount
                }}
              />
              Partial Refund
            </label>

            {/* Amount Input */}
            {(refundType === "partial" || refundType === "full" || refundType === "fee") && (
              <Input
                type="text"
                inputMode="numeric"
                placeholder={`Enter refund amount (max $${Number(selectedPayment?.amount || 0).toFixed(2)})`}
                value={partialAmount ? partialAmount : ""}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === ""){
                    setPartialAmount("");
                    return;
                  }

                  if (!/^\d*(\.\d{0,2})?$/.test(value)){
                    return;
                  }

                  const userInput = Number(value);
                  const maxAmount = Number(selectedPayment?.amount || 0);

                  if (userInput <= maxAmount) {
                    // Allow only whole numbers
                    setPartialAmount(value);
                  }
                }}
                // min="0"
                // max={Number(selectedPayment?.amount || 0).toString()}
                disabled={refundType === "full" || refundType === "fee"}
              />
            )}

            <label className="flex items-center gap-2">
                  Write your comments
              </label>

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
                  setRefundType(null);
                  setPartialAmount("");
                  setSelectedPayment(null);
                  setRemarks("");
                  setInternalRemark("");
                }}
              >
                Cancel
              </Button>

              <Button
                onClick={async () => {
                  if (!refundType) return;

                  const amountToRefund = Number(partialAmount);

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
                    refund_by: "Admin", // replace with actual admin/user info
                    evaluation_id: selectedPayment?.evalId,
                    remark,
                    internalRemark,
                  };

                  try {
                    const res = await fetch("/api/refunds", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(refundData),
                    });

                    const data =  await res.json()

                    if (!res.ok) {
                      setRefundDialog(false);
                      setRefundType(null);
                      setPartialAmount("");
                      setSelectedPayment(null);
                      setRemarks("");
                      setInternalRemark("");
                      throw new Error(data.error || "Failed to cancel payment");
                    };

                    Swal.fire({
                      icon: "success",
                      title: "Refund Successful",
                      text: `Refund of $${amountToRefund.toFixed(2)} processed successfully!`,
                    });

                    // Reset dialog
                    setRefundDialog(false);
                    setRefundType(null);
                    setPartialAmount("");
                    setSelectedPayment(null);
                    setRemarks("");
                    setInternalRemark("");

                    // Optionally refresh payments list
                    setLoading(true);
                    const refreshed = await fetch("/api/captured");
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
                disabled={!refundType && !remark && !internalRemark}
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
