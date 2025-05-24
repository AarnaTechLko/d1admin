import { put } from "@vercel/blob";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { file, fileName, mimeType } = await req.json();
        if (!file || !fileName || !mimeType) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        const buffer = Buffer.from(file, "base64");
        const { url } = await put(fileName, buffer, { contentType: mimeType, access: "public" });

        return new Response(JSON.stringify({ url }), { status: 200 });
    } catch (error) {
        console.error("Upload Error:", error);
        return new Response(JSON.stringify({ error: "Failed to upload file" }), { status: 500 });
    }
}
