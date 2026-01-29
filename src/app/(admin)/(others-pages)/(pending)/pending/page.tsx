"use client";

import React, { useEffect, useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import Input from "@/components/form/input/InputField";
import PaymentsTable from "@/components/tables/PaymentsTable";
import Swal from "sweetalert2";
import { Payment, PaymentStatus } from '@/app/types/types';
import PaymentActionLog from "@/components/PaymentActionLog";

const CapturedPaymentsPage = () => {
    const [loading, setLoading] = useState(true); // ✅ Loading state
    const [data, setData] = useState<Payment[]>([]);
    // const [partialAmount, setPartialAmount] = useState<string>("");
    // const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    // const [remark, setRemarks] = useState<string>('');
    const [commentModal, setCommentModal] = useState(false);
    const [paymentId, setPaymentId] = useState<number>(0);


    // Fetch payments
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // start spinner
            try {
                const res = await fetch("/api/pending");
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


    const closeAdminLogs = () => {
      setCommentModal(false);
    };

    const openCommentModal = (payment_id: number) => {
      console.log("payment_id", payment_id);
      setCommentModal(true);
      setPaymentId(payment_id);  
    }

  const handleRepayment = async (item: Payment) => {
    // console.log('Made it');

    if(!item.playerId || !item.coachId){
        throw new Error("The player and/or coach id is missing");
    }

    try {
      const res = await fetch('/api/repayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request: {
            amount: item.amount,
            playerId: item.playerId,
            coachId: item.coachId,
            paymentId: item.id,
            evaluationId: item.evalId,
          },
        }),
      });
      // console.log(res, 'res101>>');
      if (res.ok) {
        const data = await res.json();

        if (data.status === 'success') {
          // Old session was already completed - show success
          await Swal.fire({
            title: 'Payment Already Completed!',
            text: 'Your payment was already processed successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          window.location.href = '/pending';
        } else if (data.status === 'pending' && data.redirectUrl) {
          // New session created - redirect to payment
          window.location.href = data.redirectUrl;
        }
      } else {

        const data = await res.json();

        Swal.fire({
          title: 'Error!',
          text: data.error,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {

        Swal.fire({
          title: 'Error!',
          text: String(error),
          icon: 'error',
          confirmButtonText: 'OK',
        });

      console.log(error, 'Error >>>>');
    }
  };

    const handleRetryClick = (payment: Payment) => {
        handleRepayment(payment);
    };


    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Pending Payments</h1>

            <PaymentsTable
              data={data}
              onRefundClick={handleRetryClick}
              onCommentClick={openCommentModal}
              loading={loading} // pass loading prop
              paymentStatus={PaymentStatus.PENDING}
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
