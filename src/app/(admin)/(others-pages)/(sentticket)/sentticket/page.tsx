"use client";
import React from "react";
import SentTickets from "@/components/tables/SentTickets";
import { useRoleGuard } from "@/hooks/useRoleGaurd";
const TicketsPage = () => {
    useRoleGuard();
  
    return(

        <div className="space-y-6">
            <SentTickets/>
        </div>
    )


};

export default TicketsPage;









