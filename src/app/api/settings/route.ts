import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse, connection } from "next/server";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const settingsPatchSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  defaultLanguage: z.string().max(50).optional(),
  defaultSpeakerIdentification: z.boolean().optional(),
  defaultTranscriptionMode: z.string().max(50).optional(),
  preferences: z.record(z.string(), z.any()).optional(),
});

export async function GET() {
  await connection();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find settings
    let settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, session.user.id),
    });

    // Initialize defaults if not found
    if (!settings) {
      const newSettings = {
        id: crypto.randomUUID(),
        userId: session.user.id,
        theme: "system" as const,
        emailNotifications: true,
        pushNotifications: true,
        defaultLanguage: "en",
        defaultSpeakerIdentification: true,
        defaultTranscriptionMode: "standard",
        preferences: {},
      };

      const [inserted] = await db
        .insert(userSettings)
        .values(newSettings)
        .returning();
      settings = inserted;
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  await connection();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = settingsPatchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.flatten() },
        { status: 400 }
      );
    }

    // Find existing settings first to ensure we have them
    let settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, session.user.id),
    });

    if (!settings) {
      // If not found, insert default first
      const newSettings = {
        id: crypto.randomUUID(),
        userId: session.user.id,
        ...result.data,
      };

      const [inserted] = await db
        .insert(userSettings)
        .values(newSettings)
        .returning();
      settings = inserted;
    } else {
      // If found, update
      const updateData = {
        ...result.data,
        updatedAt: new Date(),
      };

      // Handle merging preferences deep/shallow merge if preference updates are sent
      if (result.data.preferences && settings.preferences) {
        updateData.preferences = {
          ...(settings.preferences as Record<string, any>),
          ...result.data.preferences,
        };
      }

      const [updated] = await db
        .update(userSettings)
        .set(updateData)
        .where(eq(userSettings.userId, session.user.id))
        .returning();
      settings = updated;
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
