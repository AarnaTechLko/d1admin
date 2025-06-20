"use client";

import React, { useState } from "react";
import { FacebookIcon, Instagram, Youtube, Linkedin } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import d1 from "@/public/images/signin/d1.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import Button from "../ui/button/Button";
// import { enterprises } from "@/lib/schema";
import Link from "next/link";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

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
  totalPlayers: number;
  totalCoaches: number;
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

  const MySwal = withReactContent(Swal);


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
            <Table className="text-xs">
              {/* Table Header */}
              <TableHeader className="border-b bg-gray-200 text-sm border-gray-100 dark:border-white/10">
                <TableRow>
                  {[" Name", "Address", " Data", "Status", "History", "Actions"].map(
                    (header) => (
                      <TableCell key={header} className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start">
                        {header}
                      </TableCell>
                    )
                  )}
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
                      Players: <span className="text-blue-500">{organization.totalPlayers || "0"}</span>
                      <br />
                      Teams: <span className="font-medium">{organization.totalTeams || "0"}</span>
                    </TableCell>


                    {/* Social Links */}
                    {/* <TableCell className="px-1 py-2 text-gray-500 dark:text-gray-400 flex items-center gap-3">
                      <a
                        href={organization.facebook || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={!organization.facebook ? "text-gray-400 cursor-default" : "text-blue-600 hover:text-blue-700"}
                      >
                        <FacebookIcon className="w-5 h-5" />
                      </a>

                      <a
                        href={organization.instagram || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={!organization.instagram ? "text-gray-400 cursor-default" : "text-pink-600 hover:text-red-600"}
                      >
                        <Instagram className="w-5 h-5" />
                      </a>

                      <a
                        href={organization.youtube || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={!organization.youtube ? "text-gray-400 cursor-default" : "text-red-600 hover:text-red-800"}
                      >
                        <Youtube className="w-5 h-5" />
                      </a>

                      <a
                        href={organization.linkedin || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={!organization.linkedin ? "text-gray-400 cursor-default" : "text-blue-600 hover:text-blue-800"}
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    </TableCell> */}

                    {/* Status */}
                    {/* Clickable Status Badge */}
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
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <Link href={`/organization/${organization.id}`}>
                        <Button>Open</Button>
                      </Link>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
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
                      </div>

                    </TableCell>
                  </TableRow>
                ))}

              </TableBody>

            </Table>
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
        </div>
      </div>
    </>
  );
};

export default OrganizationTable;