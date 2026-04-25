CREATE TABLE IF NOT EXISTS `lessons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text,
	`series_slug` text,
	`author_slug` text,
	`article_slug` text,
	`route_path` text,
	`serie` text,
	`tema_serie` text,
	`facilitador` text,
	`libro_de_pasaje` text,
	`titulo_de_ensenanza` text,
	`texto_nbla` text,
	`texto_nestleadam` text,
	`capitulos_de_pasaje` text,
	`versiculos_de_pasaje` text,
	`sections` text,
	`quiz` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `lessons_slug_unique` ON `lessons` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `lessons_route_path_unique` ON `lessons` (`route_path`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`order_id` text NOT NULL,
	`provider` text NOT NULL,
	`status` text NOT NULL,
	`amount` real NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
