CREATE TABLE `partner_membership_audits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`previousStatus` varchar(32) NOT NULL,
	`nextStatus` varchar(32) NOT NULL,
	`actorUserId` int,
	`note` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partner_membership_audits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `partner_accounts` MODIFY COLUMN `status` enum('pending','active','disabled','email_unverified','pending_approval','rejected','suspended') NOT NULL DEFAULT 'email_unverified';