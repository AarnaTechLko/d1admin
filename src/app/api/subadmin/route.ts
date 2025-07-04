import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admins } from "@/lib/schema";
import { eq, or, desc, count, ilike, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

const allowedRoles = ["Manager", "Customer Support", "Executive Level 1", "Executive Level 2"];

export async function POST(req: Request) {
  try {
    const { username, email, password, role } = await req.json();

    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role selected" }, { status: 400 });
    }

    const existingAdmin = await db
      .select()
      .from(admins)
      .where(and(eq(admins.email, email), eq(admins.is_deleted, 0)));

    if (existingAdmin.length > 0) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(admins).values({
      username,
      email,
      password_hash: hashedPassword,
      role,
      is_deleted: 0,
    });

    return NextResponse.json({ success: "Admin added successfully" }, { status: 201 });
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

    const baseCondition = eq(admins.is_deleted, 0);
    const searchCondition = search
      ? or(
          ilike(admins.username, `%${search}%`),
          ilike(admins.email, `%${search}%`),
          ilike(admins.role, `%${search}%`)
        )
      : undefined;

    const whereClause = searchCondition ? and(baseCondition, searchCondition) : baseCondition;

    const [adminsData, totalResult] = await Promise.all([
      db
        .select({
          id: admins.id,
          username: admins.username,
          email: admins.email,
          role: admins.role,
          created_at: admins.created_at,
          is_deleted: admins.is_deleted,
        })
        .from(admins)
        .where(whereClause)
        .orderBy(desc(admins.created_at))
        .offset(offset)
        .limit(limit),

      db
        .select({ count: count() })
        .from(admins)
        .where(whereClause)
        .then((res) => res[0]?.count || 0),
    ]);

    return NextResponse.json({
      admins: adminsData,
      currentPage: page,
      totalPages: Math.ceil(totalResult / limit),
      hasNextPage: page * limit < totalResult,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("GET /api/subadmin error:", error);
    return NextResponse.json({ message: "Failed to fetch admins", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
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
      .from(admins)
      .where(eq(admins.id, Number(adminId)));

    if (existingAdmin.length === 0) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    await db
      .update(admins)
      .set({ is_deleted: 1 }) // 👈 Mark as deleted using 1
      .where(eq(admins.id, Number(adminId)));

    return NextResponse.json({ message: "Admin deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/subadmin error:", error);
    return NextResponse.json({ message: "Failed to delete admin", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
