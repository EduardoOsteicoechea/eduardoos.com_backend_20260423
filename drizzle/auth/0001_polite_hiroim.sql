ALTER TABLE `users` RENAME COLUMN "email" TO "username";--> statement-breakpoint
DROP INDEX `users_email_unique`;--> statement-breakpoint
ALTER TABLE `users` ADD `reset_password_token` text;--> statement-breakpoint
ALTER TABLE `users` ADD `reset_password_expires` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);