import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const portfolioItems = sqliteTable(
  "portfolio_items",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    location: text("location").notNull(),
    completedAt: text("completed_at").notNull(),
    summary: text("summary").notNull(),
    beforeKey: text("before_key").notNull(),
    afterKey: text("after_key").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("portfolio_items_created_at_idx").on(table.createdAt),
  ],
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    author: text("author").notNull(),
    rating: real("rating").notNull(),
    content: text("content").notNull(),
    source: text("source").notNull(),
    sourceUrl: text("source_url").notNull().default(""),
    sourceType: text("source_type", { enum: ["manual", "daangn"] })
      .notNull()
      .default("manual"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [index("reviews_created_at_idx").on(table.createdAt)],
);
