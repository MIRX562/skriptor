import { pgTable, text, timestamp, uuid, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const transcriptions = pgTable("transcriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  filename: text("filename").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const segments = pgTable("segments", {
  id: uuid("id").defaultRandom().primaryKey(),
  transcriptionId: uuid("transcription_id")
    .notNull()
    .references(() => transcriptions.id, { onDelete: "cascade" }),
  speaker: text("speaker").notNull(),
  text: text("text").notNull(),
  start: real("start").notNull(),
  end: real("end").notNull(),
});

// Optional if using drizzle relations
export const transcriptionRelations = relations(transcriptions, ({ many }) => ({
  segments: many(segments),
}));

export const segmentRelations = relations(segments, ({ one }) => ({
  transcription: one(transcriptions, {
    fields: [segments.transcriptionId],
    references: [transcriptions.id],
  }),
}));
