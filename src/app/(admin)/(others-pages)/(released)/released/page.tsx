"use client";

import React, { useEffect, useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import Input from "@/components/form/input/InputField";
import PaymentsTable from "@/components/tables/PaymentsTable";
// import Swal from "sweetalert2";
import { Payment, PaymentStatus } from '@/app/types/types';
import PaymentActionLog from "@/components/PaymentActionLog";



const CapturedPaymentsPage = () => {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // ✅ loading state
  // const [refundDialog, setRefundDialog] = useState(false);
  // const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [commentModal, setCommentModal] = useState(false);
  const [paymentId, setPaymentId] = useState<number>(0);

  // Fetch payments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // start loading
      try {
        const res = await fetch("/api/released");
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
      setCommentModal(true);
      setPaymentId(payment_id);  
    }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Free Payments</h1>

      {/* Payments Table with loading state */}
      <PaymentsTable
        data={data}
        onCommentClick={openCommentModal}
        loading={loading} // pass loading prop
        paymentStatus={PaymentStatus.RELEASED}
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
