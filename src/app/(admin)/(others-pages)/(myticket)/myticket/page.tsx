"use client";
import React from "react";
// import SentTickets from "@/components/tables/SentTickets";
import ReceivedTickets from "@/components/tables/ReceivedTickets";
import { useRoleGuard } from "@/hooks/useRoleGaurd";
const TicketsPage = () => {
    useRoleGuard();
  
    return(

        <div className="space-y-8">
            <ReceivedTickets/>
            {/* <hr /> */}
            {/* <SentTickets/> */}
        </div>
    )


};

export default TicketsPage;









