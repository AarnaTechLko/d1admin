"use client";

import React,{useState} from "react";
import { Pencil, Trash, FacebookIcon, Instagram, Youtube, Linkedin } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import d1 from "@/public/images/signin/d1.png";


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
  facebook: string;
  instagram: string;
  linkedin: string;
  xlink: string;
  youtube: string;
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
    const itemsPerPage = 10;
    const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const handleEdit = (coachId: string) => console.log("Edit organization with ID:", coachId);

  const handleDelete = async (coachId: string) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) return;

    try {
      const response = await fetch(`/api/organization?id=${coachId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete organization");

      window.location.reload();
    } catch (error) {
      console.error("Error deleting organization:", error);
    }
  };

  return (
    <>
      {/* Pagination */}
      <div className="flex justify-end items-center gap-2 p-1">
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

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/5">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/10">
                <TableRow>
                  {[" Name", "Address", " Data", "Status", "Actions"].map(
                    (header) => (
                      <TableCell key={header} className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start">
                        {header}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y   divide-gray-100 dark:divide-white/10 text-xs">
                {data.map((organization) => (
                  <TableRow key={organization.id}>
                    {/* Organization Name & Logo */}
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                          <Image
                            width={40}
                            height={40}
                            src={organization.logo || d1}
                            alt={organization.organizationName}
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
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <Badge
                        color={
                          organization.status === "Active"
                            ? "success"
                            : organization.status === "Pending"
                              ? "warning"
                              : "error"
                        }
                      >
                        {organization.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <div className="flex gap-3">
                        <button onClick={() => handleEdit(organization.id)} className="p-2 text-green-500 hover:text-green-600">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(organization.id)} className="p-2 text-red-500 hover:text-red-600">
                          <Trash size={18} />
                        </button>
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
