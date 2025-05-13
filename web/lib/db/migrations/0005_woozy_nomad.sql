ALTER TABLE `nodes` RENAME TO `content_node`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_content_node` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`path` text NOT NULL,
	`markdown` text,
	`metadata` text NOT NULL,
	`sources` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_content_node`("id", "user_id", "title", "path", "markdown", "metadata", "sources", "created_at", "updated_at") SELECT "id", "user_id", "title", "path", "markdown", "metadata", "sources", "created_at", "updated_at" FROM `content_node`;--> statement-breakpoint
DROP TABLE `content_node`;--> statement-breakpoint
ALTER TABLE `__new_content_node` RENAME TO `content_node`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_content_nodes_user` ON `content_node` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_content_nodes_path` ON `content_node` (`path`);