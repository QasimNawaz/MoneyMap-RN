ALTER TABLE `categories` RENAME COLUMN "icon" TO "iconName";--> statement-breakpoint
ALTER TABLE `subCategories` RENAME COLUMN "icon" TO "iconName";--> statement-breakpoint
ALTER TABLE `categories` ADD `iconFamily` text;--> statement-breakpoint
ALTER TABLE `subCategories` ADD `iconFamily` text;