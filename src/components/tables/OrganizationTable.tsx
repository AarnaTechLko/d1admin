"use client";
import React from "react";
import { Pencil, Trash } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { Facebook, Instagram, Youtube,  Linkedin } from "lucide-react";
import Image from "next/image";



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
  coach: string;
  player: string;
  team: string;
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

const CoachTable: React.FC<OrganizationTableProps> = ({ data = [],
  currentPage = 1,
  totalPages = 1,
  setCurrentPage = () => { }, }) => {
  const handleEdit = (coachId: string) => {
    console.log("Edit organization with ID:", coachId);
  };

  const handleDelete = async (coachId: string) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) return;

    try {
      const response = await fetch(`/api/organization?id=${coachId}`, { method: "DELETE" });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete organization");
      }

      // Refresh page after deletion
      window.location.reload();
    } catch (error) {
      console.error("Error deleting organization:", error);
    }
  };



  

  return (
    <>
      <div className="flex justify-end items-center gap-2 p-4 border-t border-gray-200 dark:border-white/[0.05]">
        {/* Previous Button */}
        {/* <button
    onClick={() => setCurrentPage(currentPage - 1)}
    disabled={currentPage === 1}
    className={`px-4 py-2 rounded-lg text-blue-500 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:text-blue-600"}`}
  >
    Previous
  </button> */}

        {/* Numbered Pagination */}
        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              onClick={() => setCurrentPage(pageNumber)}
              className={`px-3 py-2 rounded-md ${currentPage === pageNumber
                  ? "bg-blue-500 text-white"
                  : "text-blue-500 hover:bg-gray-200"
                }`}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Next Button */}
        {/* <button
    onClick={() => setCurrentPage(currentPage + 1)}
    disabled={currentPage === totalPages}
    className={`px-4 py-2 rounded-lg text-blue-500 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:text-blue-600"}`}
  >
    Next
  </button> */}
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Organization Name
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Address
                  </TableCell>
                 

                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Organization Data
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Social Links
                  </TableCell>


                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {data.map((organization) => (
                  <TableRow key={organization.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                          <Image
                            width={40}
                            height={40}
                            src={organization.logo || "/images/signin/d1.png"}
                            alt={`${organization.organizationName} `}
                          />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 dark:text-white/90">
                            {organization.organizationName}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    {/* <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{organization.contactPerson}</TableCell> */}

                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {organization.address || "N/A"}, {organization.city || "N/A"}, {organization.state || "N/A"}, {organization.country || "N/A"}
                      <br />
                      <span className="text-blue-500">{organization.email || "N/A"}</span>
                      <br />
                      <span className="font-medium">{organization.mobileNumber || "N/A"}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{organization.coach || 0}
                      <br/>
                      <span className="text-blue-500">{organization.player || "0"}</span>
                      <br />
                      <span className="font-medium">{organization.team || "0"}</span>
                    </TableCell>

<TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 flex items-center gap-3">
  {/* Facebook */}
  <a href={organization.facebook || "#"} target="_blank" rel="noopener noreferrer">
    <Facebook className="w-5 h-5 text-blue-600 hover:text-blue-700" />
  </a>

  {/* Instagram */}
  <a href={organization.instagram || "#"} target="_blank" rel="noopener noreferrer">
    <Instagram className="w-5 h-5 text-blue-600 hover:text-pink-600" />
  </a>

  {/* YouTube */}
  <a href={organization.youtube || "#"} target="_blank" rel="noopener noreferrer">
    <Youtube className="w-5 h-5 text-blue-600 hover:text-red-700" />
  </a>

 

  {/* LinkedIn */}
  <a href={organization.linkedin || "#"} target="_blank" rel="noopener noreferrer">
    <Linkedin className="w-5 h-5 text-blue-600  hover:text-blue-800" />
  </a>
</TableCell>
               
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <Badge color={organization.status === "Active" ? "success" : organization.status === "Pending" ? "warning" : "error"}>
                        {organization.status}
                      </Badge>
                    </TableCell>
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
            {/* Pagination Controls */}
            <div className="flex justify-end items-center gap-2 p-4 border-t border-gray-200 dark:border-white/[0.05]">
              {/* Previous Button */}
              {/* <button
    onClick={() => setCurrentPage(currentPage - 1)}
    disabled={currentPage === 1}
    className={`px-4 py-2 rounded-lg text-blue-500 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:text-blue-600"}`}
  >
    Previous
  </button> */}

              {/* Numbered Pagination */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-3 py-2 rounded-md ${currentPage === pageNumber
                        ? "bg-blue-500 text-white"
                        : "text-blue-500 hover:bg-gray-200"
                      }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {/* Next Button */}
              {/* <button
    onClick={() => setCurrentPage(currentPage + 1)}
    disabled={currentPage === totalPages}
    className={`px-4 py-2 rounded-lg text-blue-500 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:text-blue-600"}`}
  >
    Next
  </button> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoachTable;
