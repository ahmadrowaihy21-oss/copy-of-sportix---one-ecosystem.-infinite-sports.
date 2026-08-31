CREATE TABLE `partner_password_reset_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`codeHash` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`attempts` int NOT NULL DEFAULT 0,
	`requestIp` varchar(64),
	`resendEmailId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partner_password_reset_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `nda_acceptances`;--> statement-breakpoint
DROP TABLE `nda_documents`;--> statement-breakpoint
DROP TABLE `partner_audit_logs`;--> statement-breakpoint
ALTER TABLE `partner_accounts` MODIFY COLUMN `mobileNumber` varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE `partner_accounts` MODIFY COLUMN `status` enum('active','disabled','email_unverified','approved','rejected','suspended') NOT NULL DEFAULT 'email_unverified';