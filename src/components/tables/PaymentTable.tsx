"use client";

import React, { useMemo } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
  PaginationState,
} from "@tanstack/react-table";
import { Payment } from "@/components/types/types";

interface PaymentTableProps {
  data: Payment[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  onHide: (evaluationId: number) => void;
  onRevert: (evaluationId: number) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({
  data,
  currentPage,
  totalPages,
  setCurrentPage,
  onHide,
  onRevert,
}) => {
  const columns = useMemo<ColumnDef<Payment>[]>(() => [
    {
      header: "Coach",
      accessorKey: "playerFirstName",
    },
    {
      header: "Evaluation",
      accessorKey: "review_title",
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (info) => `$${info.getValue()}`,
    },
    {
      header: "Status",
      accessorKey: "status",
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Created At",
      accessorKey: "created_at",
      cell: (info) =>
        new Date(info.getValue() as string).toLocaleDateString(),
    },
    {
      header: "Action",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex gap-2 justify-center">
            {p.is_deleted === 0 ? (
              <button
                onClick={() => onRevert(p.evaluation_id)}
                title="Revert"
                className="text-red-600 hover:underline"
              >
                🛑 Revert
              </button>
            ) : (
              <button
                onClick={() => onHide(p.evaluation_id)}
                title="Hide"
                className="text-green-600 hover:underline"
              >
                ♻️ Hide
              </button>
            )}
          </div>
        );
      },
    },
  ], [onHide, onRevert]);

  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: 10, // Exactly 10 items per page
      } as PaginationState,
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-2xl border border-gray-200">
      {data.length === 0 ? (
        <p className="p-6 text-gray-600">No payments found.</p>
      ) : (
        <>
          <table className="min-w-full text-xs text-left border-collapse">
            <thead className=" border-b font-medium bg-gray-200 text-xs">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`transition-colors duration-300 ${
                    row.original.is_deleted === 0 ? "bg-red-100" : "bg-white"
                  } border-b`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Simplified Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t bg-gray-50">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              ◀️ Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Next ▶️
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentTable;
