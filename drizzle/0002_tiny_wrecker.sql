CREATE TABLE `account_type` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`iconName` text,
	`iconFamily` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_type_name_unique` ON `account_type` (`name`);--> statement-breakpoint
ALTER TABLE `accounts` ADD `exclude` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `archive` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `account_type_id` integer NOT NULL REFERENCES account_type(id);