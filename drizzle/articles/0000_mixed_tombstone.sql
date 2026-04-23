CREATE TABLE `lessons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`serie` text,
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
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`order_id` text NOT NULL,
	`provider` text NOT NULL,
	`status` text NOT NULL,
	`amount` real NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
