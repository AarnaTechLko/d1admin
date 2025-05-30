import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Ensure db is correctly set up
import { admins } from "@/lib/schema"; // Import your schema
import { eq, or,desc,count, ilike } from "drizzle-orm"; // Import eq for queries
import bcrypt from "bcryptjs";

// Create a new admin
export async function POST(req: Request) {
    try {
        const { username, email, password, role } = await req.json();

        // Validate role (only allow specific roles)
        const allowedRoles = ["Customer Support", "Executive"];
        if (!role || !allowedRoles.includes(role)) {
            return NextResponse.json({ message: "Invalid role selected" }, { status: 400 });
        }

        // Check if email already exists
        const existingAdmin = await db.select().from(admins).where(eq(admins.email, email));
        if (existingAdmin.length > 0) {
            return NextResponse.json({ message: "Email already in use" }, { status: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert admin into database with role
        await db.insert(admins).values({
            username,
            email,
            password_hash: hashedPassword,
            role,
        });

        return NextResponse.json({ message: "Add successful" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error", error }, { status: 500 });
    }
}

// Fetch all admins in tabular format
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const search = url.searchParams.get("search")?.trim() || "";
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "10", 10);
        const offset = (page - 1) * limit;

        // Apply search filter across multiple fields
        const whereClause =
        //  and(
        //     eq(admin.is_deleted, false),
        
        search
            ? or(
                  ilike(admins.username, `%${search}%`),
                  ilike(admins.email, `%${search}%`),
                  ilike(admins.role, `%${search}%`)
              )
            : undefined
            // );
        // Fetch paginated results with search filter
        const adminsData = await db
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
            .limit(limit);

        // Fetch total count
        const totalCount = await db
            .select({ count: count() })
            .from(admins)
            .where(whereClause)
            .then((result) => result[0]?.count || 0);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            admins: adminsData,
            currentPage: page,
            totalPages: totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        });
    } catch (error) {
        return NextResponse.json(
            {
                message: "Failed to fetch admins",
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

    if (!adminId) {
      return NextResponse.json({ message: "Admin ID is required" }, { status: 400 });
    }

    const adminIdNumber = Number(adminId);
    if (isNaN(adminIdNumber)) {
      return NextResponse.json({ message: "Invalid Admin ID" }, { status: 400 });
    }

    // Check if the admin exists
    const existingAdmin = await db.select().from(admins).where(eq(admins.id, adminIdNumber));
    if (existingAdmin.length === 0) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    // Soft delete by setting is_deleted (assuming boolean, else use 1)
await db.delete(admins).where(eq(admins.id, adminIdNumber));

    return NextResponse.json({ message: "Admin deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete admin",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
