CREATE TABLE `portfolio_items` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`location` text NOT NULL,
	`completed_at` text NOT NULL,
	`summary` text NOT NULL,
	`before_key` text NOT NULL,
	`after_key` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`author` text NOT NULL,
	`rating` real NOT NULL,
	`content` text NOT NULL,
	`source` text NOT NULL,
	`source_url` text DEFAULT '' NOT NULL,
	`source_type` text DEFAULT 'manual' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
