ALTER TABLE `users` ADD `accessStatus` enum('pending','approved','rejected','suspended') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `accessReviewedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `accessReviewedBy` int;