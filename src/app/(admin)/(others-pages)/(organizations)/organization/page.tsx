"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrganizationTable from "@/components/tables/OrganizationTable";

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
  grade_level:string
}

const OrganizationsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/organization?search=${searchQuery}&page=${currentPage}&limit=10`
        );
    
        if (!response.ok) throw new Error("Failed to fetch data");
    
        const data = await response.json();
        console.log("API Response:", data); // ✅ Check if data is correct
        setOrganizations(data.organizations);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrganizations();
  }, [searchQuery, currentPage]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Organizations" onSearch={setSearchQuery} />
      
      {/* {loading && <p className="text-center py-5">Loading...</p>}
      {error && <p className="text-center py-5 text-red-500">{error}</p>}
      
      {!loading && !error && (
        <OrganizationTable
          data={organizations}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )} */}
      {!loading && !error && (
  <>
    <pre>{JSON.stringify(organizations, null, 2)}</pre> {/* ✅ Debug */}
    <OrganizationTable
      data={organizations}
      currentPage={currentPage}
      totalPages={totalPages}
      setCurrentPage={setCurrentPage}
    />
  </>
)}

    </div>
  );
};

export default OrganizationsPage;
