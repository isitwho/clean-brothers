CREATE TABLE `site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`featured_review_id` text DEFAULT '' NOT NULL,
	`random_review` integer DEFAULT false NOT NULL
);
