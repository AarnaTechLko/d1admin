import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coaches } from "@/lib/schema";
import { eq } from "drizzle-orm";

import {sendEmail} from '@/lib/email-service'

// import nodemailer from "nodemailer";

export async function PATCH(   
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }// ✅ remove Promise
) {
  try {

    // const protocol = req.headers.get("x-forwarded-proto") || "http";
    // const host = req.headers.get("host");
    // const baseUrl = `${protocol}://${host}`;

    const coachId =  parseInt((await params).id, 10); // ✅ no await
    if (isNaN(coachId)) {
      return NextResponse.json({ message: "Invalid coach ID" }, { status: 400 });
    }

    const { action, message } = await req.json(); // "approve" | "decline"
    if (!["approve", "decline"].includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    // Map action to status
    const statusValue = action === "approve" ? 1 : 2;

    // Update coach status
    await db
      .update(coaches)
      .set({ approved_or_denied: statusValue })
      .where(eq(coaches.id, coachId));

    // Fetch coach details
    const [coach] = await db
      .select({ email: coaches.email, firstName: coaches.firstName })
      .from(coaches)
      .where(eq(coaches.id, coachId));


      if (coach?.email && action === "approve") {
        await sendEmail({
          to: coach.email,
          subject: "D1 Notes-Approval",
          html: `Dear ${coach.firstName},<br/><br/>
                  You’ve received a new message from Admin:<br/>
                  <blockquote>${message}</blockquote>
                  <a href="https://d1notes.com/login">Login</a><br/><br/>`,
          text: message,
        });
      }
      else if (coach?.email && action === "decline") {

        await sendEmail({
          to: coach.email,
          subject: "D1 Notes-Denied",
          html: `Dear ${coach.firstName},<br/><br/>
                  You’ve received a new message from Admin:<br/>
                  <blockquote>${message}</blockquote>
                  <a href="https://d1notes.com/login">Login</a><br/><br/>`,
          text: message,
        });


      }


    return NextResponse.json({
      message: `Coach ${action === "approve" ? "approved" : "declined"} successfully`,
    });
  } catch (err) {
    console.error("PATCH /api/coach/:id/approval failed:", err);
    return NextResponse.json({ message: "Failed to update coach approval" }, { status: 500 });
  }
}
