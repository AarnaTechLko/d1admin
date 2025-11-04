import { db } from "@/lib/db";
import { admin_message, users, coaches } from "@/lib/schema";
import { eq } from "drizzle-orm";

const S3_BUCKET = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_LINK || "";

export async function GET() {
  try {
    const messages = await db.select().from(admin_message);

    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {
        // Default receiver info
        let receiverData: { name: string; image: string; type: string } = {
          name: "Unknown",
          image: "/images/signin/d1.png",
          type: "Unknown",
        };

        // ✅ Only query receiver if ID exists and is valid
        if (msg.receiver_id && Number.isInteger(msg.receiver_id)) {
          try {
            // Try to find Player
            const [player] = await db
              .select()
              .from(users)
              .where(eq(users.id, msg.receiver_id));

            if (player) {
              receiverData = {
                name: `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim() || "Unnamed Player",
                image:
                  !player.image || player.image === "null"
                    ? "/images/signin/d1.png"
                    : `${S3_BUCKET}/${player.image}`,
                type: "Player",
              };
            } else {
              // Try to find Coach
              const [coach] = await db
                .select()
                .from(coaches)
                .where(eq(coaches.id, msg.receiver_id));

              if (coach) {
                receiverData = {
                  name: `${coach.firstName ?? ""} ${coach.lastName ?? ""}`.trim() || "Unnamed Coach",
                  image:
                    !coach.image || coach.image === "null"
                      ? "/images/signin/d1.png"
                      : `${S3_BUCKET}/${coach.image}`,
                  type: "Coach",
                };
              }
            }
          } catch (err) {
            console.warn(`⚠️ Receiver lookup failed for ID ${msg.receiver_id}`, err);
          }
        }

        // ✅ Sender info (default = Admin)
        let senderName = "Admin";
        let senderImage = "/images/signin/d1.png";

        if (msg.sender_id && Number.isInteger(msg.sender_id)) {
          try {
            const [sender] = await db
              .select()
              .from(users)
              .where(eq(users.id, msg.sender_id));

            if (sender) {
              senderName = `${sender.first_name ?? ""} ${sender.last_name ?? ""}`.trim() || "Unnamed Sender";
              senderImage =
                !sender.image || sender.image === "null"
                  ? "/images/signin/d1.png"
                  : `${S3_BUCKET}/${sender.image}`;
            }
          } catch (err) {
            console.warn(`⚠️ Sender lookup failed for ID ${msg.sender_id}`, err);
          }
        }

        // ✅ Format date safely
        let formattedDate = "—";
        if (msg.created_at) {
          const date = new Date(msg.created_at);
          formattedDate = isNaN(date.getTime())
            ? "—"
            : date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
        }

        // ✅ Parse methods safely
        let parsedMethods: string[] = [];
        try {
          parsedMethods =
            typeof msg.methods === "string"
              ? JSON.parse(msg.methods)
              : Array.isArray(msg.methods)
              ? msg.methods
              : [];
        } catch {
          parsedMethods = [];
        }

        // ✅ Final enriched message
        return {
          ...msg,
          methods: parsedMethods,
          receiverName: receiverData.name,
          receiverImage: receiverData.image,
          receiverType: receiverData.type,
          senderName,
          senderImage,
          formattedDate,
        };
      })
    );

    return Response.json(enrichedMessages);
  } catch (err) {
    console.error("❌ Error fetching admin messages:", err);
    return new Response("Failed to fetch admin messages", { status: 500 });
  }
}
