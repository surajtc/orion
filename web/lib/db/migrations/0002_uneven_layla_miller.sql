ALTER TABLE `notes` ADD `user_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
CREATE INDEX `idx_notes_user` ON `notes` (`user_id`);