// src/app/api/admin/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admin, role } from "@/lib/schema";
import { SQL, gte } from "drizzle-orm";

import { eq, or, desc, count, ilike, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
type AdminFromDB = {
  id: number;
  username: string;
  email: string;
  role: string;
  role_name?: string;
  country_code: string;
  phone_number: string;
  birthdate: string;
  image?: string | null;
  created_at: Date;
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
  country_code: string;
  phone_number: string;
  birthdate: string;
  image?: string | null;
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
    const { username, email, password, role: roleName, country_code, phone_number, birthday } = await req.json();

    console.log("Fields: ", username, " ", email, " ", country_code, " ", phone_number, " ", birthday)

    // ✅ Required field validation
    if (!username || !email || !password || !roleName || !country_code || !phone_number || !birthday) {
      return NextResponse.json(
        { error: "All fields (username, email, password, role, country code, phone number, and birthday) are required" },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(roleName)) {
      return NextResponse.json({ error: "Invalid role selected" }, { status: 400 });
    }

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
      country_code,
      phone_number,
      birthdate: birthday,
      is_deleted: 1,
    }).returning();

    return NextResponse.json(
      { success: "Admin added successfully", user_id: insertedAdmin[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// --------------------- GET: List Admins ---------------------
// export async function GET(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const search = url.searchParams.get("search")?.trim() || "";
//     const page = parseInt(url.searchParams.get("page") || "1", 10);
//     const limit = parseInt(url.searchParams.get("limit") || "10", 10);
//     const offset = (page - 1) * limit;

//     const baseCondition = eq(admin.is_deleted, 1);

//     const searchCondition = search
//       ? or(
//           ilike(admin.username, `%${search}%`),
//           ilike(admin.email, `%${search}%`)
//         )
//       : undefined;

//     const whereClause = searchCondition
//       ? and(baseCondition, searchCondition)
//       : baseCondition;

//     // FIX: Extract both adminData and totalResult
//     const [adminData, totalResult] = await Promise.all([
//       db
//         .select({
//           id: admin.id,
//           username: admin.username,
//           email: admin.email,
//           role: admin.role,
//           country_code: admin.country_code,
//           phone_number: admin.phone_number,
//           birthdate: admin.birthdate,
//           image: admin.image,
//           created_at: admin.created_at,
//           is_deleted: admin.is_deleted,
//           change_password: role.change_password,
//           refund: role.refund,
//           monitor_activity: role.monitor_activity,
//           view_finance: role.view_finance,
//           access_ticket: role.access_ticket,
//         })
//         .from(admin)
//         .leftJoin(role, eq(admin.id, role.user_id))
//         .where(whereClause)
//         .orderBy(desc(admin.created_at))
//         .offset(offset)
//         .limit(limit),

//       // Count Query
//       db
//         .select({ count: count() })
//         .from(admin)
//         .where(whereClause)
//         .then((res) => Number(res[0]?.count || 0)),
//     ]);

//     // Fix permissions mapping
//     const adminWithPermissions = (adminData as AdminFromDB[]).map((a) => {
//       const permissions: Partial<Record<PermissionKey, number>> = {};
//       allPermissions.forEach((perm) => {
//         if (a[perm as keyof AdminFromDB] === 1) {
//           permissions[perm as PermissionKey] = 1;
//         }
//       });

//       return {
//         ...a,
//         permission: permissions,
//       };
//     });

//     return NextResponse.json({
//       admin: adminWithPermissions,
//       currentPage: page,
//       totalPages: Math.ceil(totalResult / limit),
//       hasNextPage: page * limit < totalResult,
//       hasPrevPage: page > 1,
//       totalRecords: totalResult,
//     });
//   } catch (error) {
//     console.error("GET /api/admin error:", error);
//     return NextResponse.json(
//       {
//         message: "Failed to fetch admin",
//         error: error instanceof Error ? error.message : String(error),
//       },
//       { status: 500 }
//     );
//   }
// }
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || "";
    const days = url.searchParams.get("days"); // <--- NEW
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const baseCondition = eq(admin.is_deleted, 1);

    const searchCondition = search
      ? or(
          ilike(admin.username, `%${search}%`),
          ilike(admin.email, `%${search}%`)
        )
      : undefined;

    // -----------------------------
    // NEW: Days Filter Condition
    // -----------------------------
    let daysCondition: SQL<unknown> | undefined = undefined;

    if (days) {
      const daysInt = parseInt(days, 10);

      if (!isNaN(daysInt) && daysInt > 0) {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - daysInt);

        daysCondition = gte(admin.created_at, fromDate);
      }
    }

    // -----------------------------
    // Combine Conditions Safely
    // -----------------------------
    const combinedConditions = [baseCondition];

    if (searchCondition) combinedConditions.push(searchCondition);
    if (daysCondition) combinedConditions.push(daysCondition);

    const whereClause =
      combinedConditions.length > 1
        ? and(...combinedConditions)
        : baseCondition;

    // ----------------------------------------
    // Fetch Data + Total Count In Parallel
    // ----------------------------------------
    const [adminData, totalResult] = await Promise.all([
      db
        .select({
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          country_code: admin.country_code,
          phone_number: admin.phone_number,
          birthdate: admin.birthdate,
          image: admin.image,
          created_at: admin.created_at,
          is_deleted: admin.is_deleted,
          change_password: role.change_password,
          refund: role.refund,
          monitor_activity: role.monitor_activity,
          view_finance: role.view_finance,
          access_ticket: role.access_ticket,
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
        .then((res) => Number(res[0]?.count ?? 0)),
    ]);

    // ----------------------------------------
    // Fix permissions
    // ----------------------------------------
    const adminWithPermissions = (adminData as AdminFromDB[]).map((a) => {
      const permissions: Partial<Record<PermissionKey, number>> = {};
      allPermissions.forEach((perm) => {
        if (a[perm as keyof AdminFromDB] === 1) {
          permissions[perm] = 1;
        }
      });

      return { ...a, permission: permissions };
    });

    return NextResponse.json({
      admin: adminWithPermissions,
      currentPage: page,
      totalPages: Math.ceil(totalResult / limit),
      hasNextPage: page * limit < totalResult,
      hasPrevPage: page > 1,
      totalRecords: totalResult,
    });
  } catch (error) {
    console.error("GET /api/admin error:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch admin",
        error: error instanceof Error ? error.message : String(error),
      },
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
    console.error("DELETE /api/admin error:", error);
    return NextResponse.json({ message: "Failed to delete admin", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// --------------------- PATCH: Update Admin & Permissions ---------------------
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();

    // ✅ Get ID from URL or request body
    const id = Number(searchParams.get("id")) || Number(body.id);
    if (!id) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
    }
    console.log("Updating Admin ID:", id);

    // ✅ Allowed fields to update
    const allowedFields: (keyof AdminUpdate)[] = [
      "username",
      "email",
      "role",
      "country_code",
      "phone_number",
      "birthdate",
      "image",
    ];

    const updateData: AdminUpdate = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    // ✅ Normalize birthdate
    if (body.birthdate) {
      const bd = body.birthdate;
      updateData.birthdate =
        bd instanceof Date ? bd.toISOString().split("T")[0] : String(bd);
    }

    // ✅ Update admin table if any fields provided
    if (Object.keys(updateData).length > 0) {
      await db.update(admin).set(updateData).where(eq(admin.id, id));
    }

    // ✅ Handle permissions
    const permissionData: Record<string, number> = {};
    allPermissions.forEach((perm) => {
      const value = body[perm];
      permissionData[perm] =
        value === true || value === 1 || value === "1" || value === "on" ? 1 : 0;
    });

    // ✅ Update or insert role row
    const existingRole = await db.select().from(role).where(eq(role.user_id, id));
    if (existingRole.length > 0) {
      await db
        .update(role)
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
        country_code: admin.country_code,
        phone_number: admin.phone_number,
        birthdate: admin.birthdate,
        image: admin.image,
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

    return NextResponse.json({
      message: "Admin updated successfully",
      updatedAdmin: updatedAdminArray[0] || null,
    });
  } catch (error) {
    console.error("PATCH /api/admin error:", error);
    return NextResponse.json(
      { error: "Failed to update admin", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}