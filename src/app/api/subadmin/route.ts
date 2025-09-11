import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admin, role } from "@/lib/schema";
import { eq, or, desc, count, ilike, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

type AdminFromDB = {
  id: number;
  username: string;
  email: string;
  role: string;
  role_name?: string;
  change_password: number;
  refund: number;
  monitor_activity: number;
  view_finance: number;
  access_ticket: number;
};
type PermissionKey = typeof allPermissions[number];
type AdminUpdate = Partial<{
  username: string;
  email: string;
  role: "Manager" | "Customer Support" | "Executive Level" | "Tech";
}>;
// Allowed roles
const allowedRoles = ["Manager", "Customer Support", "Executive Level", "Tech"];

// All possible permissions
const allPermissions = [
  "change_password",
  "refund",
  "monitor_activity",
  "view_finance",
  "access_ticket",
];

// --------------------- POST: Add Admin ---------------------
export async function POST(req: Request) {
  try {
    const { username, email, password, role: roleName } = await req.json();

    // ✅ Required field validation
    if (!username || !email || !password || !roleName) {
      return NextResponse.json(
        { error: "All fields (username, email, password, role) are required" },
        { status: 400 }
      );
    }

    // ✅ Role validation
    if (!allowedRoles.includes(roleName)) {
      return NextResponse.json({ error: "Invalid role selected" }, { status: 400 });
    }

    // ✅ Check for existing email
    const existingAdmin = await db
      .select()
      .from(admin)
      .where(and(eq(admin.email, email), eq(admin.is_deleted, 1)));

    if (existingAdmin.length > 0) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertedAdmin = await db.insert(admin).values({
      username,
      email,
      password_hash: hashedPassword,
      role: roleName,
      is_deleted: 1,
    }).returning();

    return NextResponse.json(
      { success: "Admin added successfully", user_id: insertedAdmin[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/subadmin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// --------------------- GET: List Admins ---------------------
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const baseCondition = eq(admin.is_deleted, 1);
    const searchCondition = search
      ? or(ilike(admin.username, `%${search}%`), ilike(admin.email, `%${search}%`))
      : undefined;

    const whereClause = searchCondition ? and(baseCondition, searchCondition) : baseCondition;

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

    // Map permissions into a single object
  const adminWithPermissions = (adminData as AdminFromDB[]).map((admin) => {
  const permissions: Partial<Record<PermissionKey, number>> = {};
  
allPermissions.forEach((perm) => {
    // ✅ Cast perm as keyof AdminFromDB
    if (admin[perm as keyof AdminFromDB] === 1) {
      permissions[perm as PermissionKey] = 1;
    }
  });
      const { ...rest } = admin;
      return {
        ...rest,
        permission: permissions,
      };
    });

    return NextResponse.json({
      admin: adminWithPermissions,
      currentPage: page,
      totalPages: Math.ceil(totalResult / limit),
      hasNextPage: page * limit < totalResult,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("GET /api/subadmin error:", error);
    return NextResponse.json(
      { message: "Failed to fetch admin", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// --------------------- DELETE: Soft Delete Admin ---------------------
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const adminId = url.searchParams.get("id");

    if (!adminId || isNaN(Number(adminId))) {
      return NextResponse.json({ message: "Invalid Admin ID" }, { status: 400 });
    }

    const existingAdmin = await db.select().from(admin).where(eq(admin.id, Number(adminId)));

    if (existingAdmin.length === 0) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    await db.update(admin).set({ is_deleted: 0 }).where(eq(admin.id, Number(adminId)));

    return NextResponse.json({ message: "Admin deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/subadmin error:", error);
    return NextResponse.json({ message: "Failed to delete admin", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// --------------------- PATCH: Update Admin & Permissions ---------------------
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
    }

    const body = await req.json();

    // ✅ Update allowed fields in admin
const allowedFields: (keyof AdminUpdate)[] = ["username", "email", "role"];
const updateData: AdminUpdate = {};

for (const key of allowedFields) {
  if (body[key] !== undefined) {
    updateData[key] = body[key];
  }
}

if (Object.keys(updateData).length > 0) {
  await db.update(admin).set(updateData).where(eq(admin.id, id));
}

    // ✅ Prepare permissions dynamically
    const allPermissions = [
      "change_password",
      "refund",
      "monitor_activity",
      "view_finance",
      "access_ticket",
     
    ];

    const permissionData: Record<string, number> = {};
    allPermissions.forEach((perm) => {
      const value = body[perm];
      permissionData[perm] = value === true || value === 1 || value === "1" || value === "on" ? 1 : 0;
    });

    // ✅ Update or insert role row including role_name
    const existingRole = await db.select().from(role).where(eq(role.user_id, id));
    if (existingRole.length > 0) {
      await db.update(role)
        .set({
          ...permissionData,
          role_name: body.role_name || updateData.role || existingRole[0].role_name,
        })
        .where(eq(role.user_id, id));
    } else {
      await db.insert(role).values({
        user_id: id,
        role_name: body.role_name || updateData.role || "",
        ...permissionData,
      });
    }

    // ✅ Fetch updated admin with role/permissions
    const updatedAdminArray = await db
      .select({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        role_name: role.role_name,
        change_password: role.change_password,
        refund: role.refund,
        monitor_activity: role.monitor_activity,
        view_finance: role.view_finance,
        access_ticket: role.access_ticket,
      })
      .from(admin)
      .leftJoin(role, eq(admin.id, role.user_id))
      .where(eq(admin.id, id));

    console.log("all updated data:", updatedAdminArray);

    return NextResponse.json({
      message: "Admin updated successfully",
      updatedAdmin: updatedAdminArray[0] || null,
    });
  } catch (error) {
    console.error("PATCH /api/subadmin error:", error);
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
  }
}
