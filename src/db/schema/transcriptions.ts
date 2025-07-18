import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  jsonb,
  uuid,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./users";
import { segments } from "./segments";

export const transcriptionStatus = pgEnum("transcription_status", [
  "queued",
  "processing",
  "completed",
  "failed",
]);

export const transcriptionMode = pgEnum("transcription_mode", [
  "fast",
  "medium",
  "super",
]);

export const transcriptions = pgTable("transcriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  summary: text("summary"),
  audioUrl: text("audio_url"),
  duration: integer("duration"),
  language: varchar("language", { length: 50 }).default("en"),
  status: transcriptionStatus("status").notNull().default("queued"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  metadata: jsonb("metadata"),
  isPublic: boolean("is_public").default(false),
  mode: transcriptionMode("mode").notNull().default("medium"),
  speakerIdentificationEnabled: boolean(
    "speaker_identification_enabled"
  ).default(true),
});

export const transcriptionsRelations = relations(
  transcriptions,
  ({ one, many }) => ({
    user: one(user, {
      fields: [transcriptions.userId],
      references: [user.id],
    }),
    segments: many(segments),
  })
);
