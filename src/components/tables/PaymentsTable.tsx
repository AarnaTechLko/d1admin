"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Input from "@/components/form/input/InputField";
import { NEXT_PUBLIC_AWS_S3_BUCKET_LINK } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";
import { Payment, PaymentStatus } from '@/app/types/types';


// Payment interface
// export interface Payment {
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

// Props for table
interface PaymentsTableProps {
  data: Payment[];
  itemsPerPage?: number;
  onRefundClick?: (payment: Payment) => void;
  loading?: boolean; // ✅ Add this line
  paymentStatus: PaymentStatus;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  data,
  itemsPerPage = 10,
  onRefundClick,
  loading = false, // default false
  paymentStatus,
}) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsData, setPaymentsData] = useState<Payment[]>([]);

  // Simulate loading data or use actual fetch
  useEffect(() => {
    setTimeout(() => {
      setPaymentsData(data || []);
    }, 500); // small delay for spinner demo
  }, [data]);

  // Filter payments by playerName, coachName, status, amount, and date
  const filtered = useMemo(() => {
    return paymentsData.filter((item) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        item.playerName?.toLowerCase().includes(searchLower) ||
        item.coachName?.toLowerCase().includes(searchLower) ||
        item.status?.toLowerCase().includes(searchLower) ||
        item.amount.toString().includes(searchLower);

      if (!matchesSearch) return false;

      if (filterDate) {
        const createdAt = new Date(item.created_at);
        const filterDt = new Date(filterDate);
        return createdAt.toDateString() === filterDt.toDateString();
      }

      return true;
    });
  }, [paymentsData, search, filterDate]);

  // Pagination
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="bg-white shadow-lg rounded-lg p-4">
      {/* Search + Date Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search by player, coach, status, amount..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-full border rounded-lg"
        />
        <Input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="md:w-full border rounded-lg"
        />
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto">
        <Table className="min-w-full border border-gray-200">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableCell className="font-semibold text-gray-700">ID</TableCell>
              <TableCell className="font-semibold text-gray-700">Player</TableCell>
              <TableCell className="font-semibold text-gray-700">Coach</TableCell>
              <TableCell className="font-semibold text-gray-700">Eval</TableCell>
              <TableCell className="font-semibold text-gray-700">Amount</TableCell>
              <TableCell className="font-semibold text-gray-700">Status</TableCell>
              {(paymentStatus !== PaymentStatus.REFUNDED && paymentStatus !== PaymentStatus.CANCELLED && paymentStatus !== PaymentStatus.FAILED) && (   
                <TableCell className="font-semibold text-gray-700">
                  {/* {paymentStatus === PaymentStatus.FAILED ? "Retry" : "Refund"} */}
                  Refund
                </TableCell>
              )}
              <TableCell className="font-semibold text-gray-700">Created At</TableCell>
              {(paymentStatus === PaymentStatus.REFUNDED || paymentStatus === PaymentStatus.CANCELLED) && (
                <TableCell className="font-semibold text-gray-700">Comments</TableCell>
              )}

            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span>Loading payments...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginated.length > 0 ? (
              paginated.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>

                  {/* Player Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        width={40}
                        height={40}
                        src={
                          !item.playerImage || item.playerImage === "null"
                            ? "/images/signin/d1.png"
                            : `${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${item.playerImage}`
                        }
                        alt={item.playerName ?? "Player"}
                        className="rounded-full object-cover border border-gray-200"
                      />
                      <span className="text-xs text-gray-800">{item.playerName}</span>
                    </div>
                  </TableCell>

                  {/* Coach Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        width={40}
                        height={40}
                        src={
                          !item.coachImage || item.coachImage === "null"
                            ? "/images/signin/d1.png"
                            : `${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${item.coachImage}`
                        }
                        alt={item.coachName ?? "Coach"}
                        className="rounded-full object-cover border border-gray-200"
                      />
                      <span className="text-xs text-gray-800">{item.coachName}</span>
                    </div>
                  </TableCell>

                  {/* Eval Button */}
                  <TableCell>
                    <Button
                      variant="outline"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 shadow-sm rounded-lg px-3 py-1 text-sm text-xs"
                      onClick={() => router.push(`/evaluationdetails?evaluationId=${item.evalId}`)}
                    >
                      View
                    </Button>
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="text-xs text-gray-900">
                    ${Number(item.amount || 0).toFixed(2)}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs  ${
                        item.status === PaymentStatus.CAPTURED
                          ? "bg-green-100 text-green-700"
                          : item.status === PaymentStatus.CANCELLED
                          ? "bg-red-100 text-red-700"
                          : item.status === PaymentStatus.AUTHORIZED
                          ? "bg-blue-100 text-blue-700"
                          : item.status === PaymentStatus.FAILED
                          ? "bg-red-100 text-red-700"
                          : item.status === PaymentStatus.REFUNDED
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </TableCell>

                  {/* Refund Button */}

                  {(paymentStatus !== PaymentStatus.REFUNDED && paymentStatus !== PaymentStatus.CANCELLED && paymentStatus !== PaymentStatus.FAILED) && (
                    <TableCell>
                      {onRefundClick && (
                        <Button
                          variant="secondary"
                          disabled={item.status === PaymentStatus.REFUNDED}
                          className={`${
                            item.status === PaymentStatus.REFUNDED
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : item.status === PaymentStatus.FAILED ? "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-900" : "bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-900"
                          } shadow-sm rounded-lg px-3 py-1 text-xs`}
                          onClick={() => onRefundClick(item)}
                        >
                          {/* {item.status === PaymentStatus.FAILED ? 'Retry' : 'Refund'} */}
                          Refund
                        </Button>
                      )}
                    </TableCell>
                  )}

                  {/* Created At */}
                  <TableCell> {dayjs(item.created_at).format("D-MM-YYYY, h:mm A")}</TableCell>


                  {(paymentStatus === PaymentStatus.REFUNDED || paymentStatus === PaymentStatus.CANCELLED) && (
                    <TableCell> {dayjs(item.created_at).format("D-MM-YYYY, h:mm A")}</TableCell>
                  )}

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-400 py-8">
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </Button>
          <span className="text-xs text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaymentsTable;
