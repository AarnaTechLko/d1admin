"use client";
import React from "react";
import { useRoleGuard } from "@/hooks/useRoleGaurd";

import ReceivedTickets from "@/components/tables/ReceivedTickets";
const TicketsPage = () => {
    useRoleGuard();
  
    return(

        <div className="space-y-6">
            <ReceivedTickets/>
        </div>
    )


};

export default TicketsPage;









