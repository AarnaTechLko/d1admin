import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Players | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Players  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Teams" />
      <div className="space-y-6">
          <BasicTableOne />
      </div>
    </div>
  );
}
