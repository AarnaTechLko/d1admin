"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrganizationTable from "@/components/tables/OrganizationTable";

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
  is_deleted:number;
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
        console.log("organisation",data)
        setOrganizations(data.enterprises);
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
      <PageBreadcrumb pageTitle="Organization" onSearch={setSearchQuery} />
      
      {loading && <p className="text-center py-5">Loading...</p>}
      {error && <p className="text-center py-5 text-red-500">{error}</p>}
      
      {!loading && !error && (
        <OrganizationTable
          data={organizations}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default OrganizationsPage;
