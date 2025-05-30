CREATE TABLE `nodes` (
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
CREATE INDEX `idx_nodes_user` ON `nodes` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_nodes_path` ON `nodes` (`path`);