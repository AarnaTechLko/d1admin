"use client";

import React, { useEffect, useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import Input from "@/components/form/input/InputField";
import PaymentsTable from "@/components/tables/PaymentsTable";
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cancelled Payments</h1>

      {/* Payments Table with loading state */}
      <PaymentsTable
        data={data}
        // onRefundClick={openRefundDialog}
        loading={loading} // pass loading prop
        paymentStatus={PaymentStatus.CANCELLED}
      />
    </div>
  );
};

export default CapturedPaymentsPage;
