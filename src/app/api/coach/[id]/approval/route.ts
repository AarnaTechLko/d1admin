import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coaches } from "@/lib/schema";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {

        const coachId = Number((await params).id);
        const { approved } = await req.json();

        if (isNaN(coachId))
            return NextResponse.json({ message: "Invalid coach ID" }, { status: 400 });

        // Update approval status
        await db.update(coaches)
            .set({ approved_or_denied: approved ? 1 : 0 })
            .where(eq(coaches.id, coachId));

        // Fetch coach email
        const [coach] = await db.select({
            email: coaches.email,
            firstName: coaches.firstName,
        }).from(coaches).where(eq(coaches.id, coachId));

        if (coach?.email && process.env.SMTP_HOST) {
            // Configure Nodemailer transporter
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: process.env.SMTP_SECURE === "true",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            // Email content
            const mailOptions = {
                from: `"Admin" <${process.env.SMTP_USER}>`,
                to: coach.email,
                subject: `Your Coach Application has been ${approved ? "Approved" : "Declined"}`,
                html: approved
                    ? `<p>Hi ${coach.firstName},</p><p>Congratulations! Your application has been approved.</p>
                    <p>Best regards,<br/>Admin Team</p>`
                    : `<p>Hi ${coach.firstName},</p><p>We regret to inform you that your application has been declined.</p>
          <p>Best regards,<br/>Admin Team</p>`,
            };

            // Send email
            await transporter.sendMail(mailOptions);
        } else {
            console.log(`Email would be sent to ${coach?.email}`);
        }

        return NextResponse.json({ message: `Coach ${approved ? "approved" : "declined"} successfully` });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Failed to update coach approval" }, { status: 500 });
    }
}
