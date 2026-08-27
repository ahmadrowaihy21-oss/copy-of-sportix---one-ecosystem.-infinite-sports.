ALTER TABLE `contact_messages` ADD `emailDeliveryStatus` enum('pending','accepted','failed','delivered') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `resendEmailId` varchar(128);--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `emailError` text;--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `senderEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `recipientEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `requestIp` varchar(64);--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `emailAcceptedAt` timestamp;--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `emailDeliveredAt` timestamp;--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;