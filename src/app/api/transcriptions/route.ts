import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { transcriptions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await db
      .select()
      .from(transcriptions)
      .where(eq(transcriptions.userId, session.user.id))
      .orderBy(desc(transcriptions.createdAt));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching transcriptions:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
