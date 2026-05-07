CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` enum('admin','member') NOT NULL DEFAULT 'member',
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `grades` (
	`id` varchar(36) NOT NULL,
	`student_id` varchar(36) NOT NULL,
	`student_name` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`score` int NOT NULL,
	`letter` enum('S','A','B','C','D','F') NOT NULL,
	`year` int NOT NULL,
	`semester` enum('spring','fall') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `grades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`date` date NOT NULL,
	`category` enum('important','info','maintenance') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batch_logs` (
	`id` varchar(36) NOT NULL,
	`batch_run_id` varchar(36) NOT NULL,
	`timestamp` varchar(8) NOT NULL,
	`level` enum('info','warn','error') NOT NULL,
	`message` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `batch_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batch_runs` (
	`id` varchar(36) NOT NULL,
	`batch_id` varchar(36) NOT NULL,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`finished_at` timestamp,
	`status` enum('success','failed','running') NOT NULL DEFAULT 'running',
	`duration` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `batch_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batches` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(500) NOT NULL DEFAULT '',
	`status` enum('success','failed','running','pending') NOT NULL DEFAULT 'pending',
	`schedule` json NOT NULL,
	`last_run_at` timestamp,
	`last_duration` int,
	`next_run_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `batches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `batch_logs` ADD CONSTRAINT `batch_logs_batch_run_id_batch_runs_id_fk` FOREIGN KEY (`batch_run_id`) REFERENCES `batch_runs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `batch_runs` ADD CONSTRAINT `batch_runs_batch_id_batches_id_fk` FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE cascade ON UPDATE no action;