import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admin, role } from "@/lib/schema";
import { eq, or, desc, count, ilike, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

const allowedRoles = ["Manager", "Customer Support", "Executive Level", "Tech"];
console.log("allowed",allowedRoles);
export async function POST(req: Request) {
  try {
    const { username, email, password, role: roleName } = await req.json();
   // ✅ Required field validation
   console.log("ertt",roleName);
    if (!username || !email || !password || !roleName) {
      return NextResponse.json(
        { error: "All fields (username, email, password, roleName) are required" },
        { status: 400 }
      );
    }
   // ✅ Role validation
    if (!allowedRoles.includes(roleName)) {
      return NextResponse.json({ error: "Invalid roleggvh selected" }, { status: 400 });
    }
console.log("rolename",role);
    const existingAdmin = await db
      .select()
      .from(admin)
      .where(and(eq(admin.email, email), eq(admin.is_deleted, 1)));

    if (existingAdmin.length > 0) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertedAdmin =await db.insert(admin).values({
      username,
      email,
      password_hash: hashedPassword,
      role:roleName,
      is_deleted: 1,
    }) .returning();
console.log("data",insertedAdmin );
    return NextResponse.json(  { success: "Admin added successfully", user_id: insertedAdmin[0].id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/subadmin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const baseCondition = eq(admin.is_deleted, 1);
    const searchCondition = search
      ? or(
          ilike(admin.username, `%${search}%`),
          ilike(admin.email, `%${search}%`),
          ilike(admin.role, `%${search}%`)
        )
      : undefined;

    const whereClause = searchCondition
      ? and(baseCondition, searchCondition)
      : baseCondition;

    const [adminData, totalResult] = await Promise.all([
      db
        .select({
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          change_password: role.change_password,
          refund: role.refund,
          monitor_activity: role.monitor_activity,
          view_finance: role.view_finance,
          access_ticket: role.access_ticket,
          created_at: admin.created_at,
          is_deleted: admin.is_deleted,
        })
        .from(admin)
        .leftJoin(role, eq(admin.id, role.user_id))
        .where(whereClause)
        .orderBy(desc(admin.created_at))
        .offset(offset)
        .limit(limit),

      db
        .select({ count: count() })
        .from(admin)
        .where(whereClause)
        .then((res) => res[0]?.count || 0),
    ]);

    // Filter only permissions with value = 1
    const adminWithFilteredPermissions = adminData.map((admin) => {
      const { change_password, refund, monitor_activity, view_finance, access_ticket, ...rest } = admin;
      const permissions: Record<string, number> = {};

      if (change_password === 1) permissions.change_password = 1;
      if (refund === 1) permissions.refund = 1;
      if (monitor_activity === 1) permissions.monitor_activity = 1;
      if (view_finance === 1) permissions.view_finance = 1;
      if (access_ticket === 1) permissions.access_ticket = 1;

      return {
        ...rest,
        permission: permissions,
      };
    });
console.log('all darta:',adminWithFilteredPermissions);
    return NextResponse.json({
      admin: adminWithFilteredPermissions,
      currentPage: page,
      totalPages: Math.ceil(totalResult / limit),
      hasNextPage: page * limit < totalResult,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("GET /api/subadmin error:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch admin",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const adminId = url.searchParams.get("id");

    if (!adminId || isNaN(Number(adminId))) {
      return NextResponse.json({ message: "Invalid Admin ID" }, { status: 400 });
    }

    const existingAdmin = await db
      .select()
      .from(admin)
      .where(eq(admin.id, Number(adminId)));

    if (existingAdmin.length === 0) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    await db
      .update(admin)
      .set({ is_deleted: 0 }) // 👈 Mark as deleted using 1
      .where(eq(admin.id, Number(adminId)));

    return NextResponse.json({ message: "Admin deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/subadmin error:", error);
    return NextResponse.json({ message: "Failed to delete admin", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
