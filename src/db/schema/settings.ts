import {
  pgTable,
  serial,
  boolean,
  jsonb,
  timestamp,
  varchar,
  pgEnum,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./users";

export const themes = pgEnum("themes", ["light", "dark", "system"]);

export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey(),
  userId: text("user_id")
    .references(() => user.id)
    .notNull()
    .unique(),
  theme: themes().default("system"),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  defaultLanguage: varchar("default_language", { length: 50 }).default("en"),
  defaultSpeakerIdentification: boolean(
    "default_speaker_identification"
  ).default(true),
  defaultTranscriptionMode: varchar("default_transcription_mode", {
    length: 50,
  }).default("standard"),
  preferences: jsonb("preferences").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(user, {
    fields: [userSettings.userId],
    references: [user.id],
  }),
}));
