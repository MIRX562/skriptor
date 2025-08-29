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
  "small",
  "medium",
  "large",
]);

export const transcriptions = pgTable("transcriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  language: varchar("language", { length: 50 }).default("en").notNull(),
  status: transcriptionStatus("status").notNull().default("queued"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  audioUrl: text("audio_url").notNull(),
  metadata: jsonb("metadata"),
  model: transcriptionMode("model").notNull().default("medium"),
  isSpeakerDiarized: boolean("speaker_identification_enabled")
    .default(false)
    .notNull(),
  numberOfSpeaker: integer("number_of_speaker").default(1).notNull(),
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
