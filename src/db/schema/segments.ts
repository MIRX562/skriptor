import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { transcriptions } from "./transcriptions";

export const segments = pgTable("segments", {
  id: uuid("id").defaultRandom().primaryKey(),
  transcriptionId: uuid("transcription_id")
    .references(() => transcriptions.id, { onDelete: "cascade" })
    .notNull(),
  speaker: text("speaker"),
  text: text("text").notNull(),
  startTime: integer("start_time").notNull(),
  endTime: integer("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const segmentsRelations = relations(segments, ({ one }) => ({
  transcription: one(transcriptions, {
    fields: [segments.transcriptionId],
    references: [transcriptions.id],
  }),
}));
