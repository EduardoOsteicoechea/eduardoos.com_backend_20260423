ALTER TABLE `lessons` ADD `slug` text;--> statement-breakpoint
CREATE UNIQUE INDEX `lessons_slug_unique` ON `lessons` (`slug`);