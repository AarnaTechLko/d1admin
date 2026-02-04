"use client";

import React, { useEffect, useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import Input from "@/components/form/input/InputField";
import PaymentsTable from "@/components/tables/PaymentsTable";
import PaymentActionLog from "@/components/PaymentActionLog";
// import Swal from "sweetalert2";
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
  const [loading, setLoading] = useState<boolean>(true); // ✅ loading state
  // const [refundDialog, setRefundDialog] = useState(false);
  // const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  // const [adminRemarks, setAdminRemarks] = useState<AdminLogs[]>([]);
  const [paymentId, setPaymentId] = useState<number>(0);
  const [commentModal, setCommentModal] = useState(false);

  // Fetch payments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // start loading
      try {
        const res = await fetch("/api/canceled");
        const json = await res.json();
        const records = Array.isArray(json) ? json : json.data || [];
        setData(records);
      } catch (err) {
        console.error("Failed to fetch payments:", err);
        setData([]);
      } finally {
        setLoading(false); // stop loading
      }
    };
    fetchData();
  }, []);

  // const openRefundDialog = (payment: Payment) => {
  //   setSelectedPayment(payment);
  //   setRefundDialog(true);
  // };

  const closeAdminLogs = () => {
    setCommentModal(false);
  };

  const openCommentModal = (payment_id: number) => {


    console.log("payment_id", payment_id);

    // try {
    //   const response = await fetch(`/api/admin/logs?payment_id=${payment_id}`);
    //   if (!response.ok) {
    //     const errorText = await response.text();
    //     throw new Error(`Fetch failed: ${response.status} - ${errorText}`);
    //   }

    //   const data = await response.json();
    //   console.log("images dataL", data);
    //   if (!data.replies || !Array.isArray(data.replies)) {
    //     throw new Error("Invalid response: admin logs not found");
    //   }


    //   setAdminRemarks(data.replies);
    // } catch (error) {
    //   console.error("Error fetching replies:", error);
    //   setAdminRemarks([]);
    //   Swal.fire("Error", "Could not load ticket messages.", "error");
    // }
    setCommentModal(true);
    setPaymentId(payment_id);  
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cancelled Payments</h1>

      {/* Payments Table with loading state */}
      <PaymentsTable
        data={data}
        // onRefundClick={openRefundDialog}
        onCommentClick={openCommentModal}
        loading={loading} // pass loading prop
        paymentStatus={PaymentStatus.CANCELLED}
      />

      <PaymentActionLog
        payment_id={paymentId}
        commentModal={commentModal}
        onClose={closeAdminLogs}
      />
    </div>
  );
};

export default CapturedPaymentsPage;
