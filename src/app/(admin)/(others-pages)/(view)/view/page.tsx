"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Table, TableCell, TableBody, TableHeader, TableRow } from "@/components/ui/table";
import { Trash } from "lucide-react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Loading from "@/components/Loading";
import { User, Mail, Shield, MoreHorizontal } from "lucide-react"; // Import at the top
import { useRoleGuard } from "@/hooks/useRoleGaurd";

interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
  is_deleted?: boolean;
}

const AdminListPage = () => {
      useRoleGuard();
  
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const MySwal = withReactContent(Swal);
  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/subadmin?search=${searchQuery}&page=${currentPage}&limit=10`);

        if (!response.ok) throw new Error("Failed to fetch admin data");

        const data = await response.json();

        setAdmins(data.admins);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, [searchQuery, currentPage]);
  const handleDelete = async (adminID: number) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this admin?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/subadmin?id=${adminID}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to delete admin');
      }

      // Update state to remove deleted admin
      setAdmins(prev => prev.filter(admin => admin.id !== adminID));

      await MySwal.fire('Deleted!', 'Admin has been deleted.', 'success');
    } catch (error) {
      console.error('Error deleting admin:', error);
      await MySwal.fire('Error!', `Failed to delete admin: ${error}`, 'error');
    }
  };
  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Admin List" onSearch={setSearchQuery} />

      {loading && <p className="text-center py-5">Loading...</p>}
      {error && <p className="text-center py-5 text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="flex justify-end items-center gap-2 p-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 rounded-md ${currentPage === index + 1 ? "bg-blue-500 text-white" : "text-blue-500 hover:bg-gray-200"
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="p-4 text-gray-700 dark:text-gray-300">
              Total Admins: {admins.length}
            </div>

            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow className="bg-gray-100 dark:bg-gray-800">

                  <TableCell className="px-5 py-3 text-sm font-bold text-gray-500 text-start dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <User size={16} /> Username
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-3 text-sm font-bold text-gray-500 text-start dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail size={16} /> Email
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-3 text-sm font-bold text-gray-500 text-start dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Shield size={16} /> Role
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-3 text-sm font-bold text-gray-500 text-start dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <MoreHorizontal size={16} /> Actions
                    </div>
                  </TableCell>

                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {admins.map((admin) => {
                  // const isDeleted = admin.is_deleted ?? false;

                  return (
                    <TableRow key={admin.id}>
                      <TableCell className="px-4 py-3 text-xs text-gray-800 dark:text-white/90">{admin.username}</TableCell>
                      <TableCell className="px-4 py-3 text-xs text-gray-800 dark:text-white/90">{admin.email}</TableCell>
                      <TableCell className="px-4 py-3 text-xs text-gray-800 dark:text-white/90">{admin.role}</TableCell>
                      <TableCell className="px-4 py-3 text-xs text-gray-800 dark:text-white/90">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="p-2 text-red-500 hover:text-red-600 disabled:opacity-30"
                          // disabled={isDeleted}
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="flex justify-end items-center gap-2 p-4 border-t border-gray-200 dark:border-white/[0.05]">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-3 py-1 rounded-md ${currentPage === pageNumber
                      ? "bg-blue-500 text-white"
                      : "text-blue-500 hover:bg-gray-200"
                      }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminListPage;
