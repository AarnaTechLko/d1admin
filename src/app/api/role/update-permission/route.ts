import { db } from "@/lib/db";
import { role as roleTable } from "@/lib/schema";
import { NextRequest, NextResponse } from "next/server";

// Utility to generate a random 10-digit integer
function generateTenDigitRole(): number {
  return Math.floor(1000000000 + Math.random() * 9000000000);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      user_id,
      role_name,
      role,
      permissions = [],
    }: {
      user_id?: number;
      role_name?: string;
      role?: number;
      permissions?: string[];
    } = body;

    if (!user_id || isNaN(user_id) || !role_name) {
      return NextResponse.json(
        { success: false, message: "Missing or invalid user_id or role_name" },
        { status: 400 }
      );
    }

    const roleData = {
      user_id,
      role: role || generateTenDigitRole(),
      role_name,
      change_password: permissions.includes("changePassword") ? 1 : 0,
      refund: permissions.includes("refund") ? 1 : 0,
      monitor_activity: permissions.includes("monitorActivity") ? 1 : 0,
      view_finance: permissions.includes("viewFinance") ? 1 : 0,
      access_ticket: permissions.includes("accessTicket") ? 1 : 0,
    };

    console.log("roleData:", roleData);

    await db.insert(roleTable).values(roleData);

    return NextResponse.json({
      success: true,
      message: "Role created and permissions assigned successfully",
      data: roleData,
    });
  } catch (error) {
    console.error("Error creating role and permissions:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
