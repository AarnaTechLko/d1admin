"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
<<<<<<< HEAD
import { Trash } from "lucide-react";
=======
import { Pencil, Trash } from "lucide-react";
import { redirect, useRouter } from "next/navigation";

>>>>>>> b2908e05742ec6a849537103bcf262cf1b37d6d7
interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
  is_deleted?: boolean;
}

const AdminListPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deletedAdminIds, setDeletedAdminIds] = useState<number[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // Handle Delete Function
  const handleDelete = async (adminID: number) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;

    try {
      const response = await fetch(`/api/subadmin?id=${adminID}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const text = await response.text(); // Read response safely
        throw new Error(text || "Failed to delete admin");
      }

      setDeletedAdminIds((prev) => [...prev, adminID]);

      window.location.reload();
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert(`Failed to delete admin: ${error}`);
    }
  };


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
            {/* Admin Count */}
            <div className="p-4 text-gray-700 dark:text-gray-300">
              Total Admins: {admins.length}
            </div>

            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow className="bg-gray-100">
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Username</TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Email</TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Role</TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {admins.map((admin) => (
                  <TableRow key={admin.id}
                  className={admin.is_deleted ? "bg-red-50 opacity-60" : ""}
                  >
                    <TableCell className="px-4 py-3 text-gray-800 dark:text-white/90">{admin.username}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{admin.email}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{admin.role}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
<<<<<<< HEAD
                      <div className="flex gap-3">
                        <button onClick={() => handleDelete(admin.id)} className="p-2 text-red-500 hover:text-red-600">
                          <Trash size={18} />
                        </button>
                      </div>
=======
                    {admin.is_deleted ? (
                        <span className="text-red-500 font-medium">Deleted</span>
                      ) : (
                        <div className="flex gap-3">
                          <button onClick={() => handleEdit(admin.id)} className="p-2 text-green-500 hover:text-green-600">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => handleDelete(admin.id)} className="p-2 text-red-500 hover:text-red-600">
                            <Trash size={18} />
                          </button>
                        </div>
                      )}
>>>>>>> b2908e05742ec6a849537103bcf262cf1b37d6d7
                    </TableCell>

                  </TableRow>
                ))}
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
