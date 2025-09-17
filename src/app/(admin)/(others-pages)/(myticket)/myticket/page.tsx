"use client";
import React from "react";
import SentTickets from "@/components/tables/SentTickets";
import ReceivedTickets from "@/components/tables/ReceivedTickets";
const TicketsPage = () => {
  
    return(

        <div className="space-y-6">
            <ReceivedTickets/>
            <SentTickets/>
        </div>
    )


};

export default TicketsPage;









