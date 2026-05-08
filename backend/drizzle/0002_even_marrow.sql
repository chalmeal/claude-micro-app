CREATE INDEX `batch_logs_batch_run_id_idx` ON `batch_logs` (`batch_run_id`);--> statement-breakpoint
CREATE INDEX `batch_runs_batch_id_started_at_idx` ON `batch_runs` (`batch_id`,`started_at`);