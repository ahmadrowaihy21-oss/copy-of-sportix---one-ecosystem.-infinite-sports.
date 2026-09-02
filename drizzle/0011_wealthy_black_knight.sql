CREATE TABLE `partner_nda_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`ndaFileKey` varchar(512) NOT NULL,
	`ndaFileName` varchar(255) NOT NULL,
	`ndaFileSize` int NOT NULL,
	`ndaStatus` enum('pending','approved') NOT NULL DEFAULT 'pending',
	`accountStatus` enum('pending_approval','approved') NOT NULL DEFAULT 'pending_approval',
	`accessStatus` enum('not_granted','granted') NOT NULL DEFAULT 'not_granted',
	`adminNotificationEmailId` varchar(128),
	`applicantApprovalEmailId` varchar(128),
	`approvedAt` timestamp,
	`approvedBy` int,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_nda_applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `partner_nda_applications_accountId_unique` UNIQUE(`accountId`)
);
--> statement-breakpoint
CREATE TABLE `partner_nda_approval_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partner_nda_approval_links_id` PRIMARY KEY(`id`),
	CONSTRAINT `partner_nda_approval_links_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
ALTER TABLE `partner_accounts` MODIFY COLUMN `status` enum('active','disabled','email_unverified','pending_nda','pending_approval','approved','rejected','suspended') NOT NULL DEFAULT 'email_unverified';