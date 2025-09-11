"use client";

import React, { useEffect, useState } from "react";
import { FacebookIcon, Instagram, Youtube, Linkedin } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import d1 from "@/public/images/signin/d1.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import Button from "../ui/button/Button";
// import { enterprises } from "@/lib/schema";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
type RecentMessage = {
  id: number;
  message: string;
  created_at: string;
};

interface Organization {

  id: string;
  organizationName: string;
  contactPerson: string;
  owner_name: string;
  package_id: string;
  email: string;
  mobileNumber: string;
  countryCodes: string;
  address: string;
  country: string;
  state: string;
  city: string;
  logo: string;
  status: string;
  totalUsers: number;
  totalCoaches: number;
  suspend: number;
  suspend_days: number;
  totalTeams: number;
  history?: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  xlink: string;
  youtube: string;
  is_deleted: number;

}


interface OrganizationTableProps {
  data: Organization[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const OrganizationTable: React.FC<OrganizationTableProps> = ({
  data = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [open, setOpen] = useState(false); // State for modal visibility
  const [showConfirmation, setShowConfirmation] = useState(false); // State for confirmation modal visibility
  const [confirmationCallback, setConfirmationCallback] = useState<() => void>(() => () => { }); // Callback for confirmation
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const [organization, setOrganization] = useState<{ organizations: Organization[] } | null>(null);
  const [suspendOrganization, setSuspendOrganization] = useState<Organization | null>(null);
  const [suspendDays, setSuspendDays] = useState<number | null>(null);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const MySwal = withReactContent(Swal);
  const [ipOpen, setIpOpen] = useState<number | null>(null);
  const [ipData, setIpData] = useState<{ ip: string; loginTime: string }[]>([]);
  // Read role safely
  const [messageText, setMessageText] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSMS, setSendSMS] = useState(false);
  const [sendInternal, setSendInternal] = useState(false);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const userRole = sessionStorage.getItem("role");;
  console.log("User role from session:", userRole);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserid, setSelectedUserid] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
    const [loadingOrganizationId, setLoadingOrganizationId] = useState<string | null>(null);

  const handleOpenModal = (userId: number) => {
    setSelectedUserId(userId);
    setPasswordModalOpen(true);
  };
  const router = useRouter();

  const handleCloseModal = () => {
    setSelectedUserId(null);
    setNewPassword("");
    setPasswordModalOpen(false);
  };
  const handleFetchIpInfo = async (userId: number, type: 'player' | 'coach' | 'enterprises') => {
    try {
      const res = await fetch(`/api/ip_logstab?userId=${userId}&type=${type}`);
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const result = await res.json();
      console.log("IP Log Response:", result);

      setIpData(result.data || []); // Set the IP data for dialog
      setIpOpen(userId);            // Open dialog for that user
    } catch (error) {
      console.error("Failed to fetch IP logs:", error);
    }
  };
  useEffect(() => {
    if (selectedUserid) {
      (async () => {
        try {
          const res = await axios.get(`/api/messages?type=organization&id=${selectedUserid}`);
          setRecentMessages(res.data.messages || []);
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      })();
    }
  }, [selectedUserid]);
  const handleChangePassword = async () => {
    if (!newPassword) {
      Swal.fire({
        icon: "warning",
        title: "Missing Password",
        text: "Please enter a new password.",
      });
      return;
    }

    try {
      const res = await fetch(`/api/organization/${selectedUserId}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password changed successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
        handleCloseModal();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.error || "Failed to change password.",
        });
      }
    } catch (err) {
      console.error("Change password error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
      });
    }
  };


  const getBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "error";
      case "Pending":
        return "warning";
      default:
        return undefined;
    }
  };

  // Function to handle status change after confirmation
  const handleStatusChange = async () => {
    if (!selectedOrganization) return;

    try {
      const response = await fetch("/api/organization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: selectedOrganization.id,
          newStatus: status,
        }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setOpen(false); // Close the popup after saving
      window.location.reload(); // Refresh the table to show updated status
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status. Please try again.");
    }
  };

  const confirmChange = () => {
    setShowConfirmation(true); // Show the confirmation dialog
    setConfirmationCallback(() => handleStatusChange); // Set the confirmation callback
  };


  async function handleHideOrganization(organizationId: string) {
    console.log("id", organizationId)
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This organization will be marked as hidden.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, hide it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return; // User cancelled

    try {
      const res = await fetch(`/api/organization/hide/${organizationId}`, {
        method: 'DELETE',
      });
      console.log("hide", res);

      if (!res.ok) throw new Error('Failed to hide organization');

      setOrganization((prev) => {
        if (!prev) return { organizations: [] };

        const updatedOrgs = prev.organizations.map((organization) =>
          organization.id === organizationId ? { ...organization, is_deleted: 0 } : organization
        );
        return { ...prev, organizations: updatedOrgs };
      });

      await MySwal.fire('Updated!', 'Organization hide successfully.', 'success');

      window.location.reload();

    } catch (error) {
      console.error('Hide organization error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to hide organization',
      });
    }
  }

  async function handleRevertOrganization(organizationId: string) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will revert the organization.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, revert it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return; // User cancelled

    try {
      const res = await fetch(`/api/organization/revert/${organizationId}`, {
        method: 'PATCH',
      });
      console.log("Revert", res);

      if (!res.ok) throw new Error('Failed to revert organization');

      setOrganization((prev) => {
        if (!prev) return { organizations: [] };
        const updatedOrgs = prev.organizations.map((organization) =>
          organization.id === organizationId ? { ...organization, is_deleted: 1 } : organization
        );
        return { ...prev, organizations: updatedOrgs };
      });

      await MySwal.fire('Updated!', 'Organization Revert successfully.', 'success');

      window.location.reload();

    } catch (error) {
      console.error('Revert organization error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to revert organization',
      });
    }
  }


  return (
    <>
      {/* Pagination */}
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

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="max-w-sm rounded-lg p-6 bg-white shadow-lg fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Confirm Status Change</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p>Are you sure you want to change the status to {status}?</p>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <Button
                onClick={() => {
                  setShowConfirmation(false); // Close the confirmation dialog
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
              >
                No
              </Button>
              <Button
                onClick={() => {
                  confirmationCallback(); // Proceed with the status change
                  setShowConfirmation(false); // Close the confirmation dialog
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Yes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}


      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            {data.length === 0 ? (
              <p className="p-6 text-gray-600">No organization found.</p>
            ) : (
              <>
                <Table className="text-xs">
                  {/* Table Header */}
                  <TableHeader className="border-b bg-gray-200 text-sm border-gray-100 dark:border-white/10">
                    <TableRow>
                      {[" Name", "Address", " Data", "Status", "History", "Suspend", "Actions"]
                        .map((header) => (
                          <TableCell
                            key={header}
                            className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start"
                          >
                            {header}
                          </TableCell>
                        ))}


                    </TableRow>
                  </TableHeader>


                  {/* Table Body */}
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {organization?.organizations.map((org) => (
                      <div key={org.id}>
                        <h3>{org.email}</h3>
                        {/* <p>{org.description}</p> */}
                      </div>
                    ))}

                    {data.map((organization) => (
                      <TableRow
                        key={`${organization.id}-${organization.is_deleted}`} // include is_deleted to force re-render
                        className={organization.is_deleted === 0 ? "bg-red-100" : "bg-white"}
                      >
                        {/* Organization Name & Logo */}
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 overflow-hidden rounded-full">
                              <Image
                                width={40}
                                height={40}
                                src={organization.logo || d1}
                                alt={organization.organizationName || "Organization Logo"}
                              />
                            </div>
                            <span className="block font-medium text-gray-800 dark:text-white/90">
                              {organization.organizationName}
                            </span>
                          </div>
                        </TableCell>

                        {/* Address */}
                        <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 break-words">
                          {organization.address || "N/A"}, {organization.city || "N/A"}, {organization.state || "N/A"},{" "}
                          {organization.country || "N/A"}

                          <br />
                          <span className="text-blue-500">{organization.email || "N/A"}</span>
                          <br />
                          <span className="font-medium">{organization.mobileNumber || "N/A"}</span>
                          <span className="px-1 py-2 text-gray-500 dark:text-gray-400 flex items-center gap-3">
                            <a
                              href={organization.facebook || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={!organization.facebook ? "text-gray-400 cursor-default" : "text-blue-600 hover:text-blue-700"}
                            >
                              <FacebookIcon className="w-4 h-4" />
                            </a>

                            <a
                              href={organization.instagram || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={!organization.instagram ? "text-gray-400 cursor-default" : "text-pink-600 hover:text-red-600"}
                            >
                              <Instagram className="w-4 h-4" />
                            </a>

                            <a
                              href={organization.youtube || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={!organization.youtube ? "text-gray-400 cursor-default" : "text-red-600 hover:text-red-800"}
                            >
                              <Youtube className="w-4 h-4" />
                            </a>

                            <a
                              href={organization.linkedin || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={!organization.linkedin ? "text-gray-400 cursor-default" : "text-blue-600 hover:text-blue-800"}
                            >
                              <Linkedin className="w-4 h-4" />
                            </a></span>
                        </TableCell>

                        {/* Organization Data */}
                        <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          Coaches: {organization.totalCoaches || 0}
                          <br />
                          Users: <span className="text-blue-500">{organization.totalUsers || "0"}</span>
                          <br />
                          Teams: <span className="font-medium">{organization.totalTeams || "0"}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 background-overlay">
                          <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                              <button
                                onClick={() => { setSelectedOrganization(organization); setStatus(organization.status); }}
                              >
                                <Badge color={getBadgeColor(organization.status) ?? undefined} >
                                  {organization.status}
                                </Badge>
                              </button>
                            </DialogTrigger>

                            {selectedOrganization && (
                              <DialogContent className="max-w-sm rounded-lg p-6 bg-white shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 backdrop-blur-md ">
                                <DialogHeader>
                                  <DialogTitle className="text-lg font-semibold">Change Status</DialogTitle>
                                </DialogHeader>

                                {selectedOrganization.status === "Pending" ? (
                                  <p className="text-red-500">Pending status cannot be changed.</p>
                                ) : (
                                  <div>
                                    <select
                                      value={status ?? selectedOrganization.status}
                                      onChange={(e) => setStatus(e.target.value)}
                                      className="w-full p-2 border rounded-md text-gray-700"
                                    >
                                      <option value="Active">Active</option>
                                      <option value="Inactive">Inactive</option>
                                    </select>

                                    <div className="flex justify-center mt-4">
                                      <Button onClick={confirmChange} className="bg-blue-500  text-white px-4 py-2 rounded-md">
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            )}
                          </Dialog>
                        </TableCell>
                        {/** history */}
                      {/** palyer history */}
                        <TableCell className="px-2 py-3">
                           <Button
              onClick={() => {
                setLoadingOrganizationId(organization.id); // ✅ only this org shows spinner
                router.push(`/organization/${organization.id}`);
              }}
              title="Open History"
              className="w-full flex items-center justify-center space-x-2 text-xs"
              disabled={loadingOrganizationId === organization.id}
            >
              {loadingOrganizationId === organization.id && (
                <FaSpinner className="animate-spin" />
              )}
              <span>
                {loadingOrganizationId === organization.id ? "Opening..." : "Open"}
              </span>
            </Button>
                        </TableCell>

                        <TableCell className="px-2 py-3">
                          <button
                            className="underline text-sm"
                            onClick={() => {
                              setSuspendOrganization(organization);
                              setSuspendOpen(true);
                            }}
                          >
                            <Badge
                              color={
                                (organization.suspend === 1 || organization.suspend_days === null)
                                  ? "success"
                                  : "error"
                              }
                            >
                              {(organization.suspend === 1 || organization.suspend_days === null)
                                ? "Unsuspend"
                                : "Suspend"}
                            </Badge>
                          </button>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-2 py-3 text-gray-500 dark:text-gray-400">
                          <div className="flex gap-3">
                            {organization.is_deleted === 0 ? (
                              <button
                                onClick={() => handleRevertOrganization(organization.id)}
                                title="Hide Organization"

                              >
                                🛑
                              </button>
                            ) : (
                              <button
                                onClick={() => handleHideOrganization(organization.id)}
                                title="Revert Organization"

                              >
                                ♻️
                              </button>
                            )}
                            {/* 👁️ View IP Info button */}
                            <Dialog open={ipOpen === Number(organization.id)} onOpenChange={() => setIpOpen(null)}>
                              <DialogTrigger asChild>
                                <button
                                  onClick={() => handleFetchIpInfo(Number(organization.id), 'enterprises')}
                                  className="text-blue-600 text-sm hover:underline"
                                  title="View IP Logs"
                                >
                                  👁️
                                </button>

                              </DialogTrigger>

                              <DialogContent className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
                                <DialogHeader className="border-b pb-2">
                                  <DialogTitle className="text-lg font-semibold text-gray-800">
                                    IP Login Logs
                                  </DialogTitle>
                                  <p className="text-sm text-gray-500">
                                    Recent IPs and login times for <span className="font-medium text-black">{organization.organizationName} </span>
                                  </p>
                                </DialogHeader>

                                {ipData && ipData.length > 0 ? (
                                  <>
                                    <div className="flex justify-between text-sm font-medium text-gray-700 border-b pb-1">
                                      <span>IP Address</span>
                                      <span>Login Time</span>
                                    </div>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                      {ipData.map((item, idx) => {
                                        const formattedTime = item.loginTime
                                          ? new Date(item.loginTime).toLocaleString("en-IN", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                          })
                                          : "N/A";

                                        return (
                                          <div
                                            key={idx}
                                            className="flex justify-between border-b border-gray-100 py-1 text-sm text-gray-800"
                                          >
                                            <span className="truncate max-w-[40%]">{item.ip}</span>
                                            <span className="text-right text-gray-600">{formattedTime}</span>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    <div className="pt-3 text-sm text-gray-500 text-right">
                                      Total logins: <span className="font-semibold text-black">{ipData.length}</span>
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-center text-sm text-gray-500">No IP logs found.</p>
                                )}
                              </DialogContent>
                            </Dialog>

                            <button
                              onClick={() => {
                                const changePassword = sessionStorage.getItem("change_password");

                                console.log("changepassword", changePassword);
                                if (changePassword === "1") {
                                  handleOpenModal(Number(organization.id));
                                } else {
                                  Swal.fire({
                                    icon: "warning",
                                    title: "Access Denied",
                                    text: "You are not allowed to change the password.",
                                  });
                                }
                              }} title="Change Password"
                              className="hover:text-blue-600 "
                            >
                              🔒
                            </button>
                            <button
                              onClick={() => setSelectedUserid(Number(organization.id))}
                              title="Send Message"
                              className="text-purple-600 text-sm hover:underline"
                            >
                              💬
                            </button>

                            {/* Message Modal */}
                            <Dialog
                              open={selectedUserid === Number(organization.id)}
                              onOpenChange={(isOpen) => {
                                if (!isOpen) {
                                  setSelectedUserid(null);
                                  setRecentMessages([]);
                                }
                              }}
                            >
                              <DialogContent className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
                                <DialogHeader className="border-b pb-2">
                                  <DialogTitle className="text-lg font-semibold text-gray-800">
                                    Send Message
                                  </DialogTitle>
                                  <p className="text-sm text-gray-500">
                                    Send a message to{" "}
                                    <span className="font-medium text-black">
                                      {organization.organizationName}
                                    </span>
                                  </p>
                                </DialogHeader>

                                {/* ✅ Message Type Checkboxes */}
                                <div className="flex gap-4 text-sm">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={sendEmail}
                                      onChange={() => setSendEmail(!sendEmail)}
                                    />
                                    Email
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={sendSMS}
                                      onChange={() => setSendSMS(!sendSMS)}
                                    />
                                    SMS
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={sendInternal}
                                      onChange={() => setSendInternal(!sendInternal)}
                                    />
                                    Internal Message
                                  </label>
                                </div>

                                {/* ✅ Message Textarea */}
                                <textarea
                                  rows={5}
                                  value={messageText}
                                  onChange={(e) => setMessageText(e.target.value)}
                                  className="w-full border rounded-lg p-2 text-sm text-gray-800"
                                  placeholder="Enter your message..."
                                />

                                {/* Recent Messages */}
                                <div className="max-h-32 overflow-y-auto space-y-2">
                                  {!Array.isArray(recentMessages) || recentMessages.length === 0 ? (
                                    <p className="text-xs text-gray-500">No previous messages</p>
                                  ) : (
                                    recentMessages.map((msg, idx) => (
                                      <div
                                        key={msg.id ?? idx}
                                        className="p-2 rounded-lg bg-gray-100 text-sm text-gray-800"
                                      >
                                        <p>{msg.message}</p>
                                        <span className="block text-xs text-gray-500">
                                          {new Date(msg.created_at).toLocaleString()}
                                        </span>
                                      </div>
                                    ))
                                  )}
                                </div>


                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-2">
                                  <button
                                    onClick={() => setSelectedUserid(null)}
                                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!messageText.trim()) {
                                        Swal.fire("Warning", "Please enter a message before sending.", "warning");
                                        return;
                                      }

                                      if (!sendEmail && !sendSMS && !sendInternal) {
                                        Swal.fire(
                                          "Warning",
                                          "Please select at least one method (Email, SMS, Internal).",
                                          "warning"
                                        );
                                        return;
                                      }

                                      try {
                                        await axios.post(`/api/geolocation/organization`, {
                                          type: "organization",
                                          targetIds: [organization.id],
                                          message: messageText,
                                          methods: {
                                            email: sendEmail,
                                            sms: sendSMS,
                                            internal: sendInternal,
                                          },
                                        });

                                        Swal.fire("Success", "Message sent successfully!", "success");
                                        setSelectedUserid(null);

                                        setMessageText("");

                                        // ✅ Refresh messages list after sending
                                        const res = await axios.get(`/api/messages?type=organization&id=${organization.id}`);
                                        setRecentMessages(res.data || []);
                                      } catch (err) {
                                        console.error(err);
                                        setSelectedUserid(null);

                                        Swal.fire("Error", "Failed to send message.", "error");
                                      }
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                  >
                                    Send
                                  </button>
                                </div>


                              </DialogContent>
                            </Dialog>


                          </div>

                        </TableCell>


                      </TableRow>
                    ))}

                  </TableBody>

                </Table>
              </>
            )}
            <div className="flex justify-end items-center gap-2 p-2 border-t border-gray-200 dark:border-white/[0.05]">

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
          <Dialog open={isPasswordModalOpen} onOpenChange={setPasswordModalOpen}>
            <DialogContent className="max-w-sm bg-white p-6 rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Change Password</DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <input
                  type="password"
                  className="w-full border px-4 py-2 rounded"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <div className="flex justify-end gap-2">
                  <button onClick={handleCloseModal} className="text-gray-600 hover:text-black">Cancel</button>
                  <button onClick={handleChangePassword} className="bg-blue-600 text-white px-4 py-2 rounded">
                    Update
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
            <DialogContent className="max-w-sm p-6 bg-white rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle>
                  {suspendOrganization?.suspend === 1 ? "Unsuspend Organization" : "Suspend Organization"}
                </DialogTitle>
              </DialogHeader>

              {suspendOrganization && (
                <div className="space-y-4">
                  {suspendOrganization.suspend === 1 ? (
                    <>
                      {/* Show input when organization is suspended */}
                      <p>
                        Suspend {suspendOrganization.organizationName}  for how many days?
                      </p>

                      <input
                        type="number"
                        min={1}
                        placeholder="Enter number of days"
                        value={suspendDays ?? ''}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setSuspendDays(isNaN(val) ? null : val);
                        }}
                        className="w-full p-2 border border-gray-300 rounded"
                      />

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setSuspendOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          className="bg-red-500 text-white"
                          onClick={async () => {
                            if (!suspendOrganization || suspendDays === null || suspendDays <= 0) {
                              Swal.fire({
                                icon: 'warning',
                                title: 'Invalid Input',
                                text: 'Please enter a valid number greater than 0.',
                              });
                              return;
                            }

                            try {
                              const res = await fetch(`/api/organization/${suspendOrganization.id}/suspend`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ suspend_days: suspendDays }),
                              });

                              const result = await res.json();
                              if (!res.ok) throw new Error('Failed to suspend organization');
                              console.log(result); // or use it in some logic

                              Swal.fire({
                                icon: 'success',
                                title: 'Organization Suspended',
                                text: `${suspendOrganization.organizationName} suspended for ${suspendDays} day(s).`,
                              });

                              setSuspendOpen(false);
                              setSuspendOrganization(null);
                              setSuspendDays(null);
                              window.location.reload(); // Optional
                            } catch (err) {
                              console.error("Suspension failed", err);
                              Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Could not suspend organization. Please try again.',
                              });
                            }
                          }}
                        >
                          Confirm Suspension
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Show only confirmation dialog when already active */}
                      <p>
                        Are you sure you want to unsuspend {suspendOrganization.organizationName} ?
                      </p>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setSuspendOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          className="bg-green-600 text-white"
                          onClick={async () => {
                            setSuspendOpen(false);

                            const confirm = await Swal.fire({
                              icon: 'question',
                              title: 'Confirm Unsuspend',
                              text: `Unsuspend ${suspendOrganization.organizationName}?`,
                              showCancelButton: true,
                              confirmButtonText: 'Yes, Unsuspend',
                              cancelButtonText: 'Cancel',
                            });

                            if (!confirm.isConfirmed) return;

                            try {
                              const res = await fetch(`/api/organization/${suspendOrganization.id}/suspend`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ suspend_days: 0 }), // zero triggers unsuspend
                              });

                              const result = await res.json();
                              if (!res.ok) throw new Error('Failed to unsuspend organization');
                              console.log(result); // or use it in some logic

                              Swal.fire({
                                icon: 'success',
                                title: 'Organization Unsuspended',
                                text: `${suspendOrganization.organizationName} has been unsuspended.`,
                              });

                              setSuspendOpen(false);
                              setSuspendOrganization(null);
                              setSuspendDays(null);
                              window.location.reload(); // Optional
                            } catch (err) {
                              console.error("Unsuspension failed", err);
                              Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Could not unsuspend organization. Please try again.',
                              });
                            }
                          }}
                        >
                          Confirm Unsuspend
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </>
  );
};

export default OrganizationTable;