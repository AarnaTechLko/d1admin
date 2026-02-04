"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import Button from "./ui/button/Button";
import Swal from "sweetalert2";
import { AdminLogs, PaymentStatus } from '@/app/types/types';
import Badge from "@/components/ui/badge/Badge";


interface PaymentActionLogProps {
  payment_id: number;
  onClose: () => void;
  commentModal: boolean
}

const PaymentActionLog: React.FC<PaymentActionLogProps> = ({ payment_id, commentModal , onClose }) => {

    const [adminRemarks, setAdminRemarks] = useState<AdminLogs[]>([]);

            console.log("ID: ", payment_id);


    useEffect(() => {
        setAdminRemarks([]);
        const fetchData = async () => {
        try {
            const response = await fetch(`/api/admin/logs?payment_id=${payment_id}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Fetch failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log("images dataL", data);
            if (!data.replies || !Array.isArray(data.replies)) {
                throw new Error("Invalid response: admin logs not found");
            }
                setAdminRemarks(data.replies);
            } catch (error) {
                console.error("Error fetching replies:", error);
                setAdminRemarks([]);
                Swal.fire("Error", "Could not load ticket messages.", "error");
            }
        }
        fetchData()
    },[payment_id])

    return(
        <Dialog open={commentModal} onOpenChange={onClose}>
        <DialogContent className="p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
            <DialogTitle>Payment Logs</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
                <h3 className="text-sm font-medium mb-2 text-blue-600">Previous Admin Messages</h3>
                <div className="border border-blue-300 rounded-md p-3 max-h-60 overflow-y-auto bg-gray-50 space-y-4 custom-scrollbar">
                {adminRemarks.length === 0 ? (
                    <p className="text-gray-400 text-sm">No admin messages yet.</p>
                ) : (
                    adminRemarks.map((reply) => (
                    <div key={reply.id} className="border-b pb-3">

                        <div className="text-sm text-gray-700 mb-1">
                            <span className="font-semibold">Admin: </span>{" "}
                            {reply.admin_name}
                        </div>

                        <div className="flex justify-between items-start mb-1">
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">Reason:</span> {reply.action_reason}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">Action:</span>
                            <Badge
                                color={
                                reply.action_type === PaymentStatus.CANCELLED
                                    ? "error"
                                    : reply.action_type === PaymentStatus.AUTHORIZED
                                    ? "info"
                                    : reply.action_type === PaymentStatus.CAPTURED
                                        ? "success"
                                        : reply.action_type === PaymentStatus.PENDING
                                        ? "warning"
                                        : "light"
                                }
                            >
                                {reply.action_type}
                            </Badge>
                        </div>

                        <div className="text-sm text-gray-700">
                        <span className="font-semibold">Date:</span>{" "}
                            {new Date(reply.created_at).toLocaleString()}
                        </div>
                    </div>
                    ))
                )}
                </div>
            </div>


            <div className="mt-6 flex justify-end gap-3">
                <button
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={() => {onClose();  setAdminRemarks([]);}}
                >
                Close
                </button>
            </div>

        </DialogContent>
        </Dialog>

    )


};

export default PaymentActionLog;
