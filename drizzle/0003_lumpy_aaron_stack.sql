CREATE TABLE `admin_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`pin_hash` text NOT NULL,
	`pin_salt` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `portfolio_items` ADD `split_src` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `portfolio_items` ADD `sort_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `reviews` ADD `sort_order` integer DEFAULT 0 NOT NULL;