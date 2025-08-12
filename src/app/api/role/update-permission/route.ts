import { db } from "@/lib/db";
import { role, role as roleTable } from "@/lib/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const roleData = await db
      .select({
        id: role.id,
        user_id: role.user_id,
        role: role.role,
        role_name: role.role_name,
        permission: {
          change_password: role.change_password,
          refund: role.refund,
          monitor_activity: role.monitor_activity,
          view_finance: role.view_finance,
          access_ticket: role.access_ticket,
        },
        created_at: role.created_at,
        updated_at: role.updated_at,
      })
      .from(role)
      .where(eq(role.user_id, Number(userId)))
      .limit(1);

    if (roleData.length === 0) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json(roleData[0]);
  } catch (error) {
    console.error("GET /api/role error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}