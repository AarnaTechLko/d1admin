"use client";
import React from "react";
import { Pencil, Trash } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
// import Badge from "../ui/badge/Badge";
// import Image from "next/image";

interface Organization {
  id: string;
  first_name: string;
  last_name: string;
  image: string;
  position: string;
  height: string;
  jersey: string;
weight:string;
graduation:string;
  sport: string;
  status: string;
  earnings: number;
  age_group:string;
  grade_level:string;
}

interface OrganizationTableProps {
  data: Organization[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const OrganizationTable: React.FC<OrganizationTableProps> = ({ data = [],
  currentPage = 1,
  totalPages = 1,
  setCurrentPage = () => { }, }) => {
  const handleEdit = (organizationId: string) => {
    console.log("Edit organization with ID:", organizationId);
  };

  const handleDelete = async (organizationId: string) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) return;

    try {
      const response = await fetch(`/api/organization?id=${organizationId}`, { method: "DELETE" });

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
                    Organization
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Positions
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Grade Level
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Age
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Height
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Weight
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Jersey
                  </TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                    Graduation
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
                          {/* <Image
                            width={40}
                            height={40}
                            src={organization.image && organization.image.startsWith("http") ? organization.image : "/images/default-avatar.png"}
                            alt={`${organization.first_name} ${organization.last_name}`}
                            onError={(e) => (e.currentTarget.src = "/images/default-avatar.png")} // Fallback image
                          /> */}

                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 dark:text-white/90">
                            {organization.first_name} {organization.last_name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{organization.position}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{organization.grade_level}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{organization.age_group}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{organization.height}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{organization.weight}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{organization.jersey}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{organization.graduation}</TableCell>
                  

                   
                   
                 
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

export default OrganizationTable;
