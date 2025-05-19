import {
  pgTable,
  text,
  timestamp,
  uuid,
  real,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
export const transcriptionStatus = pgEnum("transcription_status", [
  "queued",
  "processing",
  "completed",
  "failed",
]);

// Tables >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
export const transcriptions = pgTable("transcriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  filename: text("filename").notNull(),
  language: text("language").notNull(),
  status: transcriptionStatus("status").notNull().default("queued"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
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

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Relations >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
export const transcriptionRelations = relations(
  transcriptions,
  ({ many, one }) => ({
    segments: many(segments),
    user: one(user, {
      fields: [transcriptions.userId],
      references: [user.id],
    }),
  })
);

export const segmentRelations = relations(segments, ({ one }) => ({
  transcription: one(transcriptions, {
    fields: [segments.transcriptionId],
    references: [transcriptions.id],
  }),
}));
