"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Table, TableCell, TableBody, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, ShieldCheck, Trash } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { User, Mail, Shield, MoreHorizontal } from "lucide-react";
import { useRoleGuard } from "@/hooks/useRoleGaurd";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
type Permission = {
  change_password: number;
  refund: number;
  monitor_activity: number;
  view_finance: number;
  access_ticket: number;
};


interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
  permission: Permission;
  is_deleted?: boolean;
}

const AdminListPage = () => {
  useRoleGuard();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [roles, setRoles] = useState<string[]>([]); // roles extracted from admin table
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const MySwal = withReactContent(Swal);

  // 🔹 Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    role: "",
    role_name: "",
    permission: {
      change_password: 0,
      refund: 0,
      monitor_activity: 0,
      view_finance: 0,
      access_ticket: 0,
    } as Permission,
  });

  // Fetch Admins
  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/subadmin?search=${searchQuery}&page=${currentPage}&limit=10`
        );
        if (!response.ok) throw new Error("Failed to fetch admin data");

        const data = await response.json();
        setAdmins(data.admin);
        setTotalPages(data.totalPages);

        setRoles(Array.from(new Set(data.admin.map((a: Admin) => a.role))) as string[]);

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
      title: "Are you sure?",
      text: "Do you really want to delete this admin?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/subadmin?id=${adminID}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to delete admin");
      }

      setAdmins((prev) => prev.filter((a) => a.id !== adminID));
      await MySwal.fire("Deleted!", "Admin has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting admin:", error);
      await MySwal.fire("Error!", `Failed to delete admin: ${error}`, "error");
    }
  };

  const handleEditClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditData({
      username: admin.username,
      email: admin.email,
      role: admin.role, // 🔹 current role will be selected by default
      role_name: admin.role, // 🔹 current role will be selected by default
      permission: { ...admin.permission },
    });
    setIsEditOpen(true);
  };

  /*   const handleUpdate = async () => {
      if (!selectedAdmin) return;
  
      try {
        const response = await fetch(`/api/subadmin?id=${selectedAdmin.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editData),
        });
  
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Failed to update admin");
        }
  
        const updatedAdmin = { ...selectedAdmin, ...editData };
  
        setAdmins((prev) =>
          prev.map((a) => (a.id === selectedAdmin.id ? updatedAdmin : a))
        );
  
        setIsEditOpen(false);
        await MySwal.fire("Updated!", "Admin details updated successfully.", "success");
      } catch (error) {
        console.error("Error updating admin:", error);
        await MySwal.fire("Error!", `Failed to update admin: ${error}`, "error");
      }
    };
   */

  // --------------------- handleUpdate ---------------------
  const handleUpdate = async () => {
    if (!selectedAdmin) return;

    try {
      // Merge permissions ensuring all keys exist
      const mergedPermissions: Permission = {
        change_password: editData.permission?.change_password ?? 0,
        refund: editData.permission?.refund ?? 0,
        monitor_activity: editData.permission?.monitor_activity ?? 0,
        view_finance: editData.permission?.view_finance ?? 0,
        access_ticket: editData.permission?.access_ticket ?? 0,

      };

      const payload = {
        ...editData,
        ...mergedPermissions,
        role_name: editData.role ,
      };

      const response = await fetch(`/api/subadmin?id=${selectedAdmin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to update admin");
      }

      const updatedAdmin: Admin = {
        ...selectedAdmin,
        ...editData,
        permission: mergedPermissions,
      };

      setAdmins((prev) =>
        prev.map((a) => (a.id === selectedAdmin.id ? updatedAdmin : a))
      );

      setIsEditOpen(false);
      await MySwal.fire("Updated!", "Admin details updated successfully.", "success");
    } catch (error) {
      console.error("Error updating admin:", error);
      await MySwal.fire("Error!", `Failed to update admin: ${error}`, "error");
    }
  };

  const rolePermissions: Record<string, Permission> = {
    "Customer Support": {
      access_ticket: 1,
      change_password: 1,
      refund: 0,
      monitor_activity: 0,
      view_finance: 0,
    },
    Manager: {
      refund: 1,
      access_ticket: 1,
      view_finance: 1,

      change_password: 0,
      monitor_activity: 0,

    },
    Tech: {
      monitor_activity: 1,
      view_finance: 1,
      access_ticket: 1,
      change_password: 0,
      refund: 0,

    },
    "Executive Level": {
      access_ticket: 1,
      change_password: 1,
      refund: 1,
      monitor_activity: 1,
      view_finance: 1,

    },
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
                className={`px-3 py-1 rounded-md ${currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "text-blue-500 hover:bg-gray-200"
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="p-4 text-gray-700 dark:text-gray-300">
              Total admins: {admins.length}
            </div>

            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow className="bg-gray-100 dark:bg-gray-800">
                  <TableCell className="px-5 py-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <User size={16} /> Username
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail size={16} /> Email
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Shield size={16} /> Role
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} /> Permission
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <MoreHorizontal size={16} /> Actions
                    </div>
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {admins.map((admin, index) => (
                  <TableRow key={`${admin.id}-${index}`}>
                    <TableCell className="px-4 py-3 text-xs text-gray-800 dark:text-white/90">
                      {admin.username}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-gray-800 dark:text-white/90">
                      {admin.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-gray-800 dark:text-white/90">
                      {admin.role}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-gray-800 dark:text-white/90">
                      {Object.keys(admin.permission)
                        .filter((key) => admin.permission[key as keyof Permission] === 1)
                        .join(", ") || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-gray-800 dark:text-white/90">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEditClick(admin)}
                          className="p-2 text-blue-500 hover:text-blue-600"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="p-2 text-red-500 hover:text-red-600"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* 🔹 Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium">Username</label>
              <Input
                value={editData.username}
                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium">Role</label>
              <select
                value={editData.role}
                onChange={(e) => {
                  const selectedRole = e.target.value;
                  setEditData({
                    ...editData,
                   role: selectedRole,
                    //role_name: selectedRole, // <-- add role_name here
                    permission: rolePermissions[selectedRole] || {}, // load default permissions
                  });
                }}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select role</option>
                {roles.map((role, idx) => (
                  <option key={idx} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium">Permissions</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.keys(editData.permission).map((key) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editData.permission[key as keyof Permission] === 1}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          permission: {
                            ...editData.permission,
                            [key]: e.target.checked ? 1 : 0,
                          },
                        })
                      }
                    />
                    {key.replace("_", " ")}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminListPage;
