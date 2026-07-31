import { pgTable, text, timestamp, jsonb, integer, uuid } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  originalFilename: text("original_filename").notNull(),
  originalWidth: integer("original_width").notNull(),
  originalHeight: integer("original_height").notNull(),
  format: text("format").notNull(),
  analysis: jsonb("analysis"),
  adjustments: jsonb("adjustments"),
  history: jsonb("history"),
  thumbnailDataUrl: text("thumbnail_data_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
